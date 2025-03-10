// Copyright 2017-2023 @polkadot/app-referenda authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PalletReferendaDeposit, PalletReferendaTrackInfo } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';
import type { PalletReferenda } from '../../types';

import React from 'react';
import styled from 'styled-components';

import { AddressMini } from '@polkadot/react-components';

import Place from './Place';
import Refund from './Refund';

interface Props {
  canDeposit?: boolean;
  canRefund?: boolean;
  className?: string;
  decision: PalletReferendaDeposit | null;
  id: BN;
  palletReferenda: PalletReferenda;
  submit: PalletReferendaDeposit | null;
  track?: PalletReferendaTrackInfo;
}

function Deposits ({ canDeposit, canRefund, className = '', decision, id, palletReferenda, submit, track }: Props): React.ReactElement<Props> {
  return (
    <td className={`${className} address`}>
      {submit && (
        <AddressMini
          balance={submit.amount}
          value={submit.who}
          withBalance
        />
      )}
      {decision
        ? (
          <>
            <AddressMini
              balance={decision.amount}
              value={decision.who}
              withBalance
            />
            {canRefund && (
              <Refund
                id={id}
                palletReferenda={palletReferenda}
              />
            )}
          </>
        )
        : canDeposit && track && (
          <Place
            id={id}
            palletReferenda={palletReferenda}
            track={track}
          />
        )
      }
    </td>
  );
}

export default React.memo(styled(Deposits)`
  .ui--AddressMini+.ui--Button {
    margin-top: 0.25rem;
  }
`);
