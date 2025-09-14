import { useMemo, useRef, useEffect, useCallback, useState } from "react"
import { Keyboard, View, type ViewStyle, StyleSheet } from "react-native"
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

export type BottomSheetController = {
  open: () => void
  close: () => void
  expand: () => void
  collapse: () => void
  snapTo: (index: number) => void
}

export interface AppBottomSheetProps {
  children: React.ReactNode
  /**
   * Container style for the sheet's inner content wrapper
   * (not the modal/background).
   */
  style?: ViewStyle
  /**
   * Snap points accepted by @gorhom/bottom-sheet (e.g. ['25%', '50%', '90%'])
   */
  snapPoints?: (string | number)[]
  /**
   * Allow pan down to close (default: true)
   */
  enablePanDownToClose?: boolean
  /**
   * Optional external controller to imperatively control the sheet.
   * Pass a ref created with `useRef<BottomSheetController>(null)`.
   */
  controllerRef?: React.MutableRefObject<BottomSheetController | null>
  /**
   * Initial index (-1 = closed). Default: -1
   */
  initialIndex?: number
  /**
   * Fired when the sheet index changes.
   */
  onChange?: (index: number) => void
  onClose?: () => void
}

export const AppBottomSheet = (props: AppBottomSheetProps) => {
  const {
    children,
    style,
    snapPoints = ["25%", "50%", "90%"],
    enablePanDownToClose = true,
    controllerRef,
    initialIndex = -1,
    onChange,
    onClose,
  } = props

  const { themed } = useAppTheme()
  const $styles = [$contentContainer, style]

  const bottomSheetRef = useRef<BottomSheet>(null)
  const memoSnapPoints = useMemo(() => snapPoints, [snapPoints])
  const [currentIndex, setCurrentIndex] = useState(-1)

  // Expose imperative API via controllerRef (no forwardRef needed)
  useEffect(() => {
    if (!controllerRef) return

    controllerRef.current = {
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
      expand: () => bottomSheetRef.current?.expand(),
      collapse: () => bottomSheetRef.current?.collapse(),
      snapTo: (index: number) => bottomSheetRef.current?.snapToIndex(index),
    }

    // Cleanup to avoid stale refs
    return () => {
      if (controllerRef.current) controllerRef.current = null
    }
  }, [controllerRef])

  const handleChange = useCallback(
    (index: number) => {
      if (index <= 0) Keyboard.dismiss()
      onChange?.(index)
      setCurrentIndex(index)
    },
    [onChange],
  )

  return (
    <View pointerEvents={currentIndex === -1 ? "none" : "auto"} style={StyleSheet.absoluteFill}>
      <BottomSheet
        ref={bottomSheetRef}
        index={initialIndex}
        snapPoints={memoSnapPoints}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={(bsProps) => (
          <BottomSheetBackdrop
            {...bsProps}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
        onChange={handleChange}
        handleIndicatorStyle={themed($handleIndicator)}
        backgroundStyle={themed($background)}
        onClose={onClose}
      >
        <BottomSheetView style={$styles}>{children}</BottomSheetView>
      </BottomSheet>
    </View>
  )
}
const $contentContainer: ViewStyle = {
  paddingHorizontal: 20,
}

const $background: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
})

const $handleIndicator: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.secondary300,
  width: spacing.xxxl,
  height: spacing.xxs,
  borderRadius: spacing.xxxs,
  alignSelf: "center",
  marginVertical: 8,
})
