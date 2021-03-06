<template>
    <div>
        <address-detail :address="addressDetails" :loading="loading" :loading-tokens="loadingTokens" :ether-price="ethPrice" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { exchangeRate } from '@app/modules/addresses/addresses.graphql'
import { FormattedNumber } from '@app/core/helper/number-format-helper'
import { NumberFormatMixin } from '@app/core/components/mixins/number-format.mixin'
import { getEthBalance } from './addressDetails.graphql'
import { getEthBalance_getEthBalance as BalanceType } from './apolloTypes/getEthBalance'
import { Address } from '@app/modules/address/components/props'
import AddressDetail from '@app/modules/address/components/AddressDetail.vue'
import BN from 'bignumber.js'
import { CoinData } from '@app/core/components/mixins/CoinData/CoinData.mixin'
import { watch } from 'fs'
import { ErrorMessage } from '@app/modules/address/models/ErrorMessagesForAddress'

@Component({
    components: {
        AddressDetail
    },
    apollo: {
        getEthBalance: {
            query: getEthBalance,
            variables() {
                return { hash: this.address }
            },
            update: data => data.getEthBalance,
            result(data) {
                if (data.data && data.data.getEthBalance) {
                    this.hasError = false
                    this.emitErrorState()
                } else {
                    this.hasError = true
                    this.emitErrorState()
                }
            },
            error(error) {
                this.hasError = true
                this.emitErrorState()
                /*Sentry */
            }
        }
    }
})
export default class AddressOverview extends Mixins(CoinData) {
    /*
    ===================================================================================
      Props
    ===================================================================================
    */

    @Prop(String) address!: string
    @Prop(Boolean) isMiner!: boolean
    @Prop(Boolean) isContractcreator!: boolean
    @Prop(Boolean) isContract!: boolean
    @Prop(Number) totalErc20Owned!: number
    @Prop(Boolean) loadingTokens!: boolean
    @Prop(Boolean) updateBalance!: boolean
    /*
    ===================================================================================
      Initial Data
    ===================================================================================
    */
    getEthBalance!: BalanceType
    hasError = false

    /*
    ===================================================================================
      Computed Values
    ===================================================================================
    */
    get addressDetails(): Address {
        return {
            hash: this.address,
            balance: this.getEthBalance ? this.getEthBalance.balance : '0',
            isMiner: this.isMiner,
            isContractCreator: this.isContractcreator,
            isContract: this.isContract,
            totalERC20: this.totalErc20Owned
        }
    }

    get loading(): boolean {
        return this.hasError ? true : this.$apollo.queries.getEthBalance.loading
    }

    /*
    ===================================================================================
      Methods
    ===================================================================================
    */
    emitErrorState(): void {
        this.$emit('errorBalance', this.hasError, ErrorMessage.balance)
    }

    /*
    ===================================================================================
     Watch
    ===================================================================================
    */
    @Watch('updateBalance')
    onUpdateBalanceChanged(): void {
        if (this.updateBalance && !this.$apollo.queries.getEthBalance.loading) {
            this.$apollo.queries.getEthBalance.refetch()
            this.$emit('resetBalanceUpdate')
        }
    }
}
</script>
