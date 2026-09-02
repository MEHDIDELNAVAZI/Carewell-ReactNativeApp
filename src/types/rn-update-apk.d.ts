declare module 'rn-update-apk' {
  interface UpdateApkOptions {
    fielProviderAuthority: string;
    downloadApkStart?: () => void;
    downloadApkProgress?: (percent: number) => void;
    downloadApkEnd?: () => void;
    onError?: (err: any) => void;
    needUpdateApp?: (needUpdate: (confirm: boolean) => void) => void;
    forceUpdateApp?: () => void;
    notNeedUpdateApp?: () => void;
    iosAppId?: string;
    apkVersionUrl?: string;
  }

  export default class UpdateApk {
    constructor(options: UpdateApkOptions);
    downloadApk(params: { apkUrl: string }): void;
    checkUpdate(): void;
  }
}