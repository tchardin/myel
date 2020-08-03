// Copied from https://github.com/openworklabs/filecoin-number to add types
import BigNumber from 'bignumber.js';

// not sure how we want to configure rounding for this
BigNumber.set({ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN});
BigNumber.config({EXPONENTIAL_AT: [-19, 20]});

// stores filecoin numbers in denominations of Fil, not AttoFil
export class FilecoinNumber extends BigNumber {
  constructor(amount: string, denom: 'fil' | 'attofil') {
    super(denom === 'attofil' ? new BigNumber(amount).shiftedBy(-18) : amount);
  }
  toFil = () => this.toString();

  toAttoFil = () => this.shiftedBy(18).toFixed(0, 1);
}
