type VariantType = 'default' | 'error' | 'success' | 'warning' | 'info';

export type SnackbarType = {
  message: string;
  variant: VariantType;
};
