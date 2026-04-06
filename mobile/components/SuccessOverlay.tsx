import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

interface SuccessOverlayProps {
  /** Message displayed below the checkmark */
  message: string;
  /** Callback fired after the animation completes */
  onFinish: () => void;
  /** How long (ms) the overlay stays visible before fading out (default: 1400) */
  displayDuration?: number;
}

/**
 * Full-screen animated success overlay with a scaling checkmark circle
 * and a message that fades/slides in. Automatically calls `onFinish`
 * after the display duration elapses.
 */
export default function SuccessOverlay({
  message,
  onFinish,
  displayDuration = 1400,
}: SuccessOverlayProps) {
  const backdropOpacity = useSharedValue(0);
  const circleScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(18);
  const textOpacity = useSharedValue(0);
  const overallOpacity = useSharedValue(1);

  useEffect(() => {
    // Backdrop fade-in
    backdropOpacity.value = withTiming(1, { duration: 200 });

    // Circle pops in with a spring
    circleScale.value = withDelay(
      100,
      withSpring(1, { damping: 12, stiffness: 180 }),
    );

    // Checkmark fades in after circle lands
    checkOpacity.value = withDelay(300, withTiming(1, { duration: 200 }));

    // Text slides up and fades in
    textOpacity.value = withDelay(400, withTiming(1, { duration: 250 }));
    textTranslateY.value = withDelay(
      400,
      withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) }),
    );

    // Fade everything out, then fire the callback
    overallOpacity.value = withDelay(
      displayDuration,
      withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
  }, []);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * overallOpacity.value,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: overallOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value * overallOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value * overallOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <View style={styles.content}>
        <Animated.View style={[styles.circle, circleStyle]}>
          <Animated.View style={checkStyle}>
            <Ionicons name="checkmark-sharp" size={52} color="#fff" />
          </Animated.View>
        </Animated.View>
        <Animated.Text style={[styles.message, textStyle]}>
          {message}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    marginTop: 24,
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
