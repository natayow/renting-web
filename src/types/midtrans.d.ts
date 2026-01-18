interface MidtransSnapOptions {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

interface MidtransSnap {
  pay: (token: string, options?: MidtransSnapOptions) => void;
  hide: () => void;
  show: () => void;
}

interface Window {
  snap?: MidtransSnap;
}
