import { Text, TextInput } from 'react-native';

type ComponentWithDefaultProps = {
  defaultProps?: {
    allowFontScaling?: boolean;
    maxFontSizeMultiplier?: number;
  };
};

export function disableFontScaling(): void {
  const RNText = Text as typeof Text & ComponentWithDefaultProps;
  RNText.defaultProps = RNText.defaultProps ?? {};
  RNText.defaultProps.allowFontScaling = false;
  RNText.defaultProps.maxFontSizeMultiplier = 1;

  const RNTextInput = TextInput as typeof TextInput & ComponentWithDefaultProps;
  RNTextInput.defaultProps = RNTextInput.defaultProps ?? {};
  RNTextInput.defaultProps.allowFontScaling = false;
  RNTextInput.defaultProps.maxFontSizeMultiplier = 1;
}
