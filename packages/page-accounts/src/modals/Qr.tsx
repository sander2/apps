// Copyright 2017-2023 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActionStatus } from '@polkadot/react-components/Status/types';
import type { ModalProps } from '../types';

import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { AddressRow, Button, Input, InputAddress, MarkWarning, Modal, QrScanAddress } from '@polkadot/react-components';
import { useApi, useIpfs } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';

import { useTranslation } from '../translate';
import PasswordInput from './PasswordInput';

interface Scanned {
  content: string;
  isAddress: boolean;
  genesisHash: string;
  name?: string;
}

interface Props extends ModalProps {
  className?: string;
  onClose: () => void;
  onStatusChange: (status: ActionStatus) => void;
}

interface Address {
  address: string;
  isAddress: boolean;
  scanned: Scanned | null;
  warning?: string | null;
}

function QrModal ({ className = '', onClose, onStatusChange }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api, isEthereum } = useApi();
  const { isIpfs } = useIpfs();
  const [{ isNameValid, name }, setName] = useState({ isNameValid: false, name: '' });
  const [{ address, isAddress, scanned, warning }, setAddress] = useState<Address>({ address: '', isAddress: false, scanned: null });
  const [{ isPasswordValid, password }, setPassword] = useState({ isPasswordValid: false, password: '' });

  const isValid = !!address && isNameValid && (isAddress || isPasswordValid);

  const scannedGenesisWarn = useMemo(
    () => !!scanned && !!scanned.genesisHash && !api.genesisHash.eq(scanned.genesisHash),
    [scanned, api]
  );

  const _onNameChange = useCallback(
    (name: string) => setName({ isNameValid: !!name.trim(), name }),
    []
  );

  const _onPasswordChange = useCallback(
    (password: string, isPasswordValid: boolean) => setPassword({ isPasswordValid, password }),
    []
  );

  const _onScan = useCallback(
    (scanned: Scanned): void => {
      setAddress({
        address: scanned.isAddress
          ? scanned.content
          : keyring.createFromUri(scanned.content, {}, 'sr25519').address,
        isAddress: scanned.isAddress,
        scanned
      });

      if (scanned.name) {
        _onNameChange(scanned.name);
      }
    },
    [_onNameChange]
  );

  const _onError = useCallback(
    (err: Error): void => {
      setAddress({
        address: '',
        isAddress: false,
        scanned: null,
        warning: err.message
      });
    },
    []
  );

  const _onSave = useCallback(
    (): void => {
      if (!scanned || !isValid) {
        return;
      }

      const { content, isAddress } = scanned;
      const meta = {
        genesisHash: scanned.genesisHash || api.genesisHash.toHex(),
        name: name.trim()
      };
      const account = isAddress
        ? isEthereum ? keyring.addExternal(content).pair.address : keyring.addExternal(content, meta).pair.address
        : keyring.addUri(content, password, meta, 'sr25519').pair.address;

      InputAddress.setLastValue('account', account);

      onStatusChange({
        account,
        action: 'create',
        message: t<string>('created account'),
        status: 'success'
      });
      onClose();
    },
    [api, isValid, name, onClose, onStatusChange, password, scanned, isEthereum, t]
  );

  return (
    <Modal
      className={className}
      header={t<string>('Add account via Qr')}
      onClose={onClose}
      size='large'
    >
      <Modal.Content>
        {scanned
          ? (
            <>
              <Modal.Columns>
                <AddressRow
                  defaultName={name}
                  noDefaultNameOpacity
                  value={scanned.content}
                />
              </Modal.Columns>
              <Modal.Columns hint={t<string>('The local name for this account. Changing this does not affect your on-line identity, so this is only used to indicate the name of the account locally.')}>
                <Input
                  autoFocus
                  className='full'
                  help={t<string>('Name given to this account. You can change it at any point in the future.')}
                  isError={!isNameValid}
                  label={t<string>('name')}
                  onChange={_onNameChange}
                  onEnter={_onSave}
                  value={name}
                />
                {scannedGenesisWarn && (
                  <MarkWarning content={t<string>('The genesisHash for the scanned account does not match the genesisHash of the connected chain. The account will not be usable on this chain.')} />
                )}
              </Modal.Columns>
              {!isAddress && (
                <PasswordInput
                  onChange={_onPasswordChange}
                  onEnter={_onSave}
                />
              )}
            </>
          )
          : (
            <Modal.Columns hint={t<string>('Provide the account QR from the module/external application for scanning. Once detected as valid, you will be taken to the next step to add the account to your list.')}>
              <div className='qr-wrapper'>
                <QrScanAddress
                  isEthereum={isEthereum}
                  onError={_onError}
                  onScan={_onScan}
                />
              </div>
              {warning && <MarkWarning content={warning} />}
            </Modal.Columns>
          )
        }
      </Modal.Content>
      <Modal.Actions>
        <Button
          icon='plus'
          isDisabled={!scanned || !isValid || (!isAddress && isIpfs)}
          label={t<string>('Save')}
          onClick={_onSave}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(styled(QrModal)`
  .qr-wrapper {
    margin: 0 auto;
    max-width: 30rem;
  }
`);
