import * as React from 'react';
import { SecretKind, k8sCreate, k8sUpdate } from '@console/internal/module/k8s';
import { SecretModel } from '@console/internal/models';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';

type useSecretArgs = {
  secretName: string;
  namespace: string;
};

export type useSecretResult = {
  secret: SecretKind;
  isSecretLoaded: boolean;
  secretLoadingError: string;
  createOrUpdateSecret: (
    keyValue: string,
    selectedNamespace: string,
    opts?: { secretName: string },
  ) => void;
};

const useSecret = ({ secretName, namespace }: useSecretArgs) => {
  const [secret, isSecretLoaded, secretLoadingError] = useK8sWatchResource<SecretKind>({
    kind: SecretModel.kind,
    name: secretName,
    namespace,
  });

  const createOrUpdateSecret = React.useCallback(
    async (secretValue: string, selectedNamespace: string, opts?: { secretName: string }) => {
      const createOrUpdate = secret ? k8sUpdate : k8sCreate;
      try {
        await createOrUpdate(SecretModel, {
          kind: SecretModel.kind,
          apiVersion: SecretModel.apiVersion,
          metadata: {
            name: opts?.secretName || secretName,
            namespace: selectedNamespace,
          },
          data: { key: btoa(secretValue) },
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e.message);
      }
    },
    [secret, secretName],
  );

  return {
    secret,
    isSecretLoaded,
    secretLoadingError,
    createOrUpdateSecret,
  };
};

export default useSecret;
