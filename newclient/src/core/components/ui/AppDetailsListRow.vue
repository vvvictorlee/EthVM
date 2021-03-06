<template>
    <div>
        <v-layout align-center justify-start row class="ma-2">
            <!--
      =====================================================================================
        DETAIL TITLE
      =====================================================================================
      -->
            <v-flex xs4 sm3 md2>
                <div class="info--text font-weight-medium">{{ detail.title }}</div>
            </v-flex>
            <!--
      =====================================================================================
        DETAIL INFO
      =====================================================================================
      -->
            <v-flex v-if="!detail.txInput" xs7 sm8 md9 pr-0>
                <div v-if="isLoading">
                    <v-layout align-center justify-start mr-2>
                        <v-flex xs12 pa-0>
                            <v-progress-linear color="lineGrey" value="40" indeterminate height="16" class="ma-0" />
                        </v-flex>
                    </v-layout>
                </div>
                <div v-else>
                    <div v-if="!isMono">
                        <router-link v-if="detail.link" :to="detail.link">
                            <div class="text-truncate secondary--text">{{ detail.detail }}</div>
                        </router-link>
                        <div v-else class="text-muted text-truncate detail-container">
                            <span class="pr-1">{{ detail.detail }}</span>
                            <app-tooltip v-if="detail.tooltip" :text="detail.tooltip" />
                            <v-layout
                                v-if="detail.priceChange && percentageChange.value"
                                :class="[detail.tooltip ? 'pl-3' : 'pl-2', priceChangeClass, 'price-container', 'font-weight-medium']"
                                row
                                wrap
                                align-center
                                justify-start
                            >
                                (<span class="pl-1">{{ percentageChange.value }}%</span>
                                <v-img v-if="priceChangeSymbol === '+'" :src="require('@/assets/up.png')" height="16px" max-width="16px" contain></v-img>
                                <v-img v-if="priceChangeSymbol === '-'" :src="require('@/assets/down.png')" height="16px" max-width="16px" contain></v-img>
                                )
                            </v-layout>
                        </div>
                    </div>
                    <div v-else>
                        <app-transform-hash v-if="detail.link" :hash="detail.detail" :link="detail.link" />
                        <app-transform-hash v-else :hash="detail.detail" :is-blue="false" />
                    </div>
                </div>
            </v-flex>
            <v-flex v-if="!detail.txInput" xs1 pt-0 pb-0 pl-1>
                <app-copy-to-clip v-if="detail.copy" :value-to-copy="detail.detail" />
            </v-flex>
            <v-flex v-if="detail.txInput" hidden-sm-and-down sm9 md10>
                <div class="data-input pa-3">
                    <p v-for="(item, index) in detail.txInput" :key="index" class="mb-2">{{ item }}</p>
                </div>
            </v-flex>
        </v-layout>
        <v-layout v-if="detail.txInput" align-start justify-start row class="mr-2 ml-2">
            <v-flex xs12 hidden-md-and-up pt-0>
                <div class="data-input pa-3">
                    <p v-for="(item, index) in detail.txInput" :key="index" class="mb-2">{{ item }}</p>
                </div>
            </v-flex>
        </v-layout>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Mixins } from 'vue-property-decorator'
import { Detail } from '@app/core/components/props'
import AppCopyToClip from '@app/core/components/ui/AppCopyToClip.vue'
import AppTransformHash from '@app/core/components/ui/AppTransformHash.vue'
import AppTooltip from '@app/core/components/ui/AppTooltip.vue'
import BN from 'bignumber.js'
import { FormattedNumber } from '@app/core/helper/number-format-helper'
import { NumberFormatMixin } from '@app/core/components/mixins/number-format.mixin'

@Component({
    components: {
        AppTooltip,
        AppCopyToClip,
        AppTransformHash
    }
})
export default class AppDetailsListRow extends Mixins(NumberFormatMixin) {
    /*
  ===================================================================================
    Props
  ===================================================================================
  */

    @Prop(Object) detail!: Detail
    @Prop(Boolean) isLoading!: boolean

    /*
  ===================================================================================
    Computed
  ===================================================================================
  */

    get percentageChange(): FormattedNumber {
        const change = this.detail.priceChange || 0
        return this.formatPercentageValue(new BN(change))
    }

    get priceChangeSymbol() {
        const change = this.detail.priceChange || 0
        if (change > 0) {
            return '+'
        }
        if (change < 0) {
            return '-'
        }
        return ''
    }

    get priceChangeClass(): string {
        const change = this.detail.priceChange || 0
        if (change > 0) {
            return 'txSuccess--text'
        }
        if (change < 0) {
            return 'txFail--text'
        }
        return 'black--text'
    }

    get isMono(): boolean {
        return !!this.detail.mono
    }
}
</script>

<style scoped lang="css">
.data-input {
    border: 1.2px solid #dee5f0;
    border-radius: 5px;
}
.detail-container {
    display: flex;
}
.price-container {
    margin-bottom: 0 !important;
}
</style>
