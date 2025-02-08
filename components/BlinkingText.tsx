import React, {useEffect} from 'react';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

const BlinkingText = ({children, style}: {children: string; style?: any}) => {
  const opacity = useSharedValue(1);
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0, {duration: 1000, easing: Easing.linear}),
      -1,
      true,
    );

    return () => {
      cancelAnimation(opacity);
    };
  }, [opacity]);
  return (
    <Animated.Text style={[{...style}, animatedTextStyle]}>
      {children}
    </Animated.Text>
  );
};

export default BlinkingText;
