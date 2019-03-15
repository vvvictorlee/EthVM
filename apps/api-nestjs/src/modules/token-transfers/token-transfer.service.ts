import { BadRequestException, HttpException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { TokenTransferEntity } from '@app/orm/entities/token-transfer.entity'
import { MongoRepository } from 'typeorm'
import { EthplorerTokenOperationDto } from '@app/modules/token-transfers/ethplorer-token-operation.dto'
import { ConfigService } from '@app/shared/config.service'

const axios = require('axios')

@Injectable()
export class TokenTransferService {
  constructor(
    @InjectRepository(TokenTransferEntity)
    private readonly tokenTransferRepository: MongoRepository<TokenTransferEntity>,
    private readonly configService: ConfigService
  ) {}

  async findAddressTokenTransfers(address: string, take: number = 10, page: number = 0): Promise<TokenTransferEntity[]> {
    const skip = take * page
    return this.tokenTransferRepository.find({
      where: { contract: address, transferType: { $not: { $eq: 'ETHER' } } },
      take,
      skip,
      order: { timestamp: -1 }
    })
  }

  async findAddressTokenTransfersByHolder(
    address: string,
    holder: string,
    filter: string = 'all',
    take: number = 10,
    page: number = 0
  ): Promise<TokenTransferEntity[]> {
    const skip = take * page
    let where
    switch (filter) {
      case 'in':
        where = { contract: address, transferType: { $not: { $eq: 'ETHER' } }, from: holder }
        break
      case 'out':
        where = { contract: address, transferType: { $not: { $eq: 'ETHER' } }, to: holder }
        break
      default:
        where = { contract: address, transferType: { $not: { $eq: 'ETHER' } }, $or: [{ from: holder }, { to: holder }] }
        break
    }
    return this.tokenTransferRepository.find({ where, take, skip, order: { timestamp: -1 } })
  }

  async fetchTokenHistory(address: string): Promise<EthplorerTokenOperationDto[]> {

    // TODO ensure ParseAddressPipe has been used!

    address = `0x${address}`

    const baseUrl = this.configService.ethplorer.url
    const apiKey = this.configService.ethplorer.apiKey
    const url = `${baseUrl}getTokenHistory/${address}?apiKey=${apiKey}&type=transfer&limit=10`

    const res = await axios.get(url)

    if (res.status !== 200) {
      throw new HttpException(res.statusText, res.status)
    }

    const { operations, error } = res.data

    if (error) {
      throw new HttpException(error.message, error.code)
    }

    return operations ? operations.map(o => new EthplorerTokenOperationDto(o)) : []

  }

}
