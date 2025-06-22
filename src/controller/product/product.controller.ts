import { firstValueFrom } from 'rxjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  CreateProductInput,
  UpdateProductInput,
} from 'src/dto/product/product.inputs';
import { ApiBearerAuth, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { ProductResponse } from 'src/dto/product/product.response';
import { RestAuthGuard } from 'src/guards';
import { ClientGrpc } from '@nestjs/microservices';
import {
  PRODUCT_SERVICE_NAME,
  ProductServiceClient,
} from 'src/generated/product';
import { STORE_SERVICE_NAME, StoreServiceClient } from 'src/generated/store';

@ApiBearerAuth()
@UseGuards(RestAuthGuard)
@Controller('product')
export class ProductController {
  constructor(
    @Inject('product') private productClient: ClientGrpc,
    @Inject('store') private storeClient: ClientGrpc,
  ) {}
  private service: ProductServiceClient;
  private storeService: StoreServiceClient;
  onModuleInit() {
    this.service =
      this.productClient.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
    this.storeService =
      this.storeClient.getService<StoreServiceClient>(STORE_SERVICE_NAME);
  }

  @ApiOkResponse({
    description: 'Created Product',
    type: ProductResponse,
  })
  @ApiBody({ type: CreateProductInput })
  @Put('create')
  async create(
    @Req() req: { user: { id: string } },
    @Body() data: CreateProductInput,
  ) {
    const store = await firstValueFrom(
      this.storeService.getByOwner({ id: req.user.id }),
    );
    return this.service.create({ storeId: store.id, ...data });
  }

  @Get(':id')
  product(@Param('id') id: string) {
    return this.service.get({ id });
  }

  @Get(':id')
  async products(@Req() req: { user: { id: string } }) {
    const store = await firstValueFrom(
      this.storeService.getByOwner({ id: req.user.id }),
    );
    return this.service.getStoreProducts({ id: store.id });
  }

  @ApiBody({ type: CreateProductInput })
  @Patch('update/:id')
  updateProduct(@Param('id') id: string, @Body() data: UpdateProductInput) {
    return this.service.update({ id, ...data });
  }

  @Delete(':id/delete')
  deleteProduct(@Param('id') id: string) {
    return this.service.delete({ id });
  }
}
