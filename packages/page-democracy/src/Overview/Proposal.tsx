// Copyright 2017-2023 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveProposal } from '@polkadot/api-derive/types';

import React, { useCallback, useMemo } from 'react';

import { AddressMini, Button, Columar, ExpandButton, ExpanderScroll, LinkExternal } from '@polkadot/react-components';
import { useToggle } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';
import { formatNumber } from '@polkadot/util';

import { useTranslation } from '../translate';
import PreImageButton from './PreImageButton';
import ProposalCell from './ProposalCell';
import Seconding from './Seconding';

interface Props {
  className?: string;
  value: DeriveProposal;
}

function Proposal ({ className = '', value: { balance, image, imageHash, index, proposer, seconds } }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [isExpanded, toggleIsExpanded] = useToggle(false);

  const seconding = useMemo(
    () => seconds.filter((_address, index) => index !== 0),
    [seconds]
  );

  const renderSeconds = useCallback(
    () => seconding.map((address, count): React.ReactNode => (
      <AddressMini
        key={`${count}:${address.toHex()}`}
        value={address}
        withBalance={false}
        withShrink
      />
    )),
    [seconding]
  );

  return (
    <>
      <tr className={`${className}${isExpanded ? ' noBorder' : ''}`}>
        <td className='number'><h1>{formatNumber(index)}</h1></td>
        <ProposalCell
          imageHash={imageHash}
          proposal={image?.proposal}
        />
        <td className='address'>
          <AddressMini value={proposer} />
        </td>
        <td className='number together media--1200'>
          <FormatBalance value={balance} />
        </td>
        <td className='expand'>
          {seconding.length !== 0 && (
            <ExpanderScroll
              empty={seconding && t<string>('No endorsements')}
              renderChildren={renderSeconds}
              summary={t<string>('Endorsed ({{count}})', { replace: { count: seconding.length } })}
            />
          )}
        </td>
        <td className='actions'>
          <Button.Group>
            {!image?.proposal && (
              <PreImageButton imageHash={imageHash} />
            )}
            <Seconding
              deposit={balance}
              depositors={seconds || []}
              image={image}
              proposalId={index}
            />
            <ExpandButton
              expanded={isExpanded}
              onClick={toggleIsExpanded}
            />
          </Button.Group>
        </td>
      </tr>
      <tr className={`${className} ${isExpanded ? 'isExpanded' : 'isCollapsed'}`}>
        <td />
        <td
          className='columar'
          colSpan={100}
        >
          <Columar is100>
            <Columar.Column>
              <LinkExternal
                data={index}
                type='proposal'
                withTitle
              />
            </Columar.Column>
          </Columar>
        </td>
      </tr>
    </>
  );
}

export default React.memo(Proposal);
