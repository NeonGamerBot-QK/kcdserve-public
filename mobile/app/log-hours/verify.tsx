import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Alert,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Ionicons } from "@expo/vector-icons";
import SignatureScreen from "react-native-signature-canvas";
import * as ImagePicker from "expo-image-picker";
import { page2Schema, Page2Values } from "../../lib/schemas/serviceHour";
import { useLogHoursFormStore } from "../../store/logHoursForm";
import { useSubmitServiceHour } from "../../hooks/useSubmitServiceHour";
import { useTheme } from "../../hooks/useTheme";
import type { ServiceHourFormValues } from "../../lib/schemas/serviceHour";

export default function LogHoursPage2() {
  const store = useLogHoursFormStore();
  const submitMutation = useSubmitServiceHour();
  const { isDark } = useTheme();

  const [signatureData, setSignatureData] = useState<string | null>(
    store.page2.signature ?? null,
  );
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [photos, setPhotos] = useState<string[]>(store.page2.photos ?? []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Page2Values>({
    resolver: standardSchemaResolver(page2Schema),
    defaultValues: {
      supervisorName: store.page2.supervisorName ?? "",
      supervisorEmail: store.page2.supervisorEmail ?? "",
      signature: store.page2.signature ?? undefined,
      photos: store.page2.photos ?? [],
    },
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const bgPage = isDark ? "bg-slate-900" : "bg-white";
  const bgInput = isDark ? "bg-slate-800" : "bg-slate-50";
  const borderInput = isDark ? "border-slate-700" : "border-slate-200";
  const borderHeader = isDark ? "border-slate-700" : "border-slate-100";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textLabel = isDark ? "text-slate-200" : "text-slate-700";
  const bgPhotoBtn = isDark ? "bg-slate-800" : "bg-slate-50";
  const textPhotoBtn = isDark ? "text-slate-300" : "text-slate-600";

  const focusedFieldClass = (focused: boolean) =>
    `${bgInput} border rounded-xl px-4 py-3 font-inter text-base ${textPrimary} ${
      focused ? "border-primary-500" : borderInput
    }`;

  async function pickPhoto(source: "camera" | "library") {
    let result: ImagePicker.ImagePickerResult;

    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission Needed",
          "Enable camera access in Settings to take photos.",
        );
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        quality: 0.8,
      });
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Photo Library Permission Needed",
          "Enable photo library access in Settings to attach photos.",
        );
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.8,
        allowsMultipleSelection: false,
      });
    }

    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  const onSubmit = handleSubmit(async (page2Data) => {
    const payload: ServiceHourFormValues = {
      ...(store.page1 as ServiceHourFormValues),
      ...page2Data,
      signature: signatureData ?? undefined,
      photos,
    };

    try {
      await submitMutation.mutateAsync(payload);
      store.reset();
      router.replace("/(tabs)/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Submission failed. Try again.";
      Alert.alert("Submission Error", message);
    }
  });

  return (
    <SafeAreaView className={`flex-1 ${bgPage}`}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-3 border-b ${borderHeader}`}>
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? "#f1f5f9" : "#0f172a"} />
        </Pressable>
        <Text className={`flex-1 text-center font-inter-semibold text-lg ${textPrimary}`}>
          Review & Submit
        </Text>
        <View className="w-9" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        >
          {/* Supervisor Name */}
          <Text className={`font-inter-medium text-sm ${textLabel} mb-1.5`}>
            Supervisor Name
          </Text>
          <Controller
            control={control}
            name="supervisorName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={focusedFieldClass(focusedField === "supervisorName")}
                placeholder="Full name"
                placeholderTextColor="#94a3b8"
                value={value}
                onChangeText={onChange}
                onFocus={() => setFocusedField("supervisorName")}
                onBlur={() => {
                  onBlur();
                  setFocusedField(null);
                }}
              />
            )}
          />
          {errors.supervisorName && (
            <Text className="text-xs text-red-500 mt-1">
              {errors.supervisorName.message}
            </Text>
          )}

          {/* Supervisor Email */}
          <Text className={`font-inter-medium text-sm ${textLabel} mb-1.5 mt-5`}>
            Supervisor Email
          </Text>
          <Controller
            control={control}
            name="supervisorEmail"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={focusedFieldClass(
                  focusedField === "supervisorEmail",
                )}
                placeholder="supervisor@example.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onFocus={() => setFocusedField("supervisorEmail")}
                onBlur={() => {
                  onBlur();
                  setFocusedField(null);
                }}
              />
            )}
          />
          {errors.supervisorEmail && (
            <Text className="text-xs text-red-500 mt-1">
              {errors.supervisorEmail.message}
            </Text>
          )}

          {/* Signature */}
          <Text className={`font-inter-medium text-sm ${textLabel} mb-1.5 mt-5`}>
            Supervisor Signature{" "}
            <Text className={`font-inter ${isDark ? "text-slate-500" : "text-slate-400"}`}>(optional)</Text>
          </Text>
          <Pressable
            onPress={() => setShowSignatureModal(true)}
            className={`border ${borderInput} rounded-xl ${bgInput} items-center justify-center overflow-hidden`}
            style={{ height: 80 }}
          >
            {signatureData ? (
              <View className="w-full h-full">
                <Image
                  source={{ uri: signatureData }}
                  style={{ width: "100%", height: 60 }}
                  resizeMode="contain"
                />
                <View
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 8,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                </View>
              </View>
            ) : (
              <View className="items-center gap-1">
                <Ionicons name="pencil-outline" size={22} color="#94a3b8" />
                <Text className="font-inter text-sm text-slate-400">
                  Tap to sign
                </Text>
              </View>
            )}
          </Pressable>
          {signatureData && (
            <Pressable
              onPress={() => setSignatureData(null)}
              className="mt-1 self-end"
            >
              <Text className="font-inter text-xs text-red-400">Clear</Text>
            </Pressable>
          )}

          {/* Signature Modal */}
          <Modal
            visible={showSignatureModal}
            animationType="slide"
            onRequestClose={() => setShowSignatureModal(false)}
          >
            <SafeAreaView className={`flex-1 ${bgPage}`}>
              <View className={`flex-row items-center px-4 py-3 border-b ${borderHeader}`}>
                <Pressable
                  onPress={() => setShowSignatureModal(false)}
                  className="w-9 h-9 items-center justify-center"
                >
                  <Ionicons name="close" size={24} color={isDark ? "#f1f5f9" : "#0f172a"} />
                </Pressable>
                <Text className={`flex-1 text-center font-inter-semibold text-lg ${textPrimary}`}>
                  Supervisor Signature
                </Text>
                <View className="w-9" />
              </View>
              <Text className={`text-center font-inter text-sm ${isDark ? "text-slate-400" : "text-slate-500"} px-5 mt-3`}>
                Ask your supervisor to sign below
              </Text>
              <View className="flex-1 mt-2">
                <SignatureScreen
                  onOK={(sig) => {
                    setSignatureData(sig);
                    setShowSignatureModal(false);
                  }}
                  onEmpty={() =>
                    Alert.alert(
                      "No Signature",
                      "Please draw a signature before confirming.",
                    )
                  }
                  descriptionText=""
                  clearText="Clear"
                  confirmText="Confirm"
                  webStyle={`
                    .m-signature-pad { box-shadow: none; border: none; }
                    .m-signature-pad--body { border: none; }
                    .m-signature-pad--footer { background-color: ${isDark ? "#1e293b" : "white"}; padding: 8px 16px; }
                    .button.clear { background-color: ${isDark ? "#334155" : "#f1f5f9"}; color: ${isDark ? "#f1f5f9" : "#0f172a"}; border-radius: 8px; }
                    .button.save { background-color: #22c55e; color: white; border-radius: 8px; }
                  `}
                />
              </View>
            </SafeAreaView>
          </Modal>

          {/* Photos */}
          <Text className={`font-inter-medium text-sm ${textLabel} mb-1.5 mt-5`}>
            Photos <Text className={`font-inter ${isDark ? "text-slate-500" : "text-slate-400"}`}>(optional)</Text>
          </Text>
          <View className="flex-row gap-3 mb-3">
            <Pressable
              onPress={() => pickPhoto("camera")}
              className={`flex-1 flex-row items-center justify-center gap-2 border ${borderInput} rounded-xl py-3 ${bgPhotoBtn}`}
            >
              <Ionicons name="camera-outline" size={18} color="#64748b" />
              <Text className={`font-inter-medium text-sm ${textPhotoBtn}`}>
                Take Photo
              </Text>
            </Pressable>
            <Pressable
              onPress={() => pickPhoto("library")}
              className={`flex-1 flex-row items-center justify-center gap-2 border ${borderInput} rounded-xl py-3 ${bgPhotoBtn}`}
            >
              <Ionicons name="images-outline" size={18} color="#64748b" />
              <Text className={`font-inter-medium text-sm ${textPhotoBtn}`}>
                From Library
              </Text>
            </Pressable>
          </View>
          {photos.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {photos.map((uri, index) => (
                <View key={uri + index} style={{ position: "relative" }}>
                  <Image
                    source={{ uri }}
                    style={{ width: 80, height: 80, borderRadius: 8 }}
                  />
                  <Pressable
                    onPress={() => removePhoto(index)}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      backgroundColor: "#ef4444",
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="close" size={12} color="white" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            className={`mt-8 rounded-xl py-3.5 items-center ${
              isSubmitting ? "bg-primary-300" : "bg-primary-500"
            }`}
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            <Text className="font-inter-semibold text-base text-white">
              {isSubmitting ? "Submitting…" : "Submit Hours"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
