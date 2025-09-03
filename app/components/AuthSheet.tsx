import { memo, useEffect, useMemo, useRef, useState } from "react"
import {
  Platform,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  Image,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native"
import * as Apple from "expo-apple-authentication"
import * as Application from "expo-application"
import { makeRedirectUri } from "expo-auth-session"
import { ImageStyle } from "expo-image"
import * as Google from "expo-auth-session/providers/google"
import { OtpInput } from "react-native-otp-entry"
import Animated, {
  FadeInDown,
  FadeOutDown,
  FadeInLeft,
  FadeOutLeft,
  FadeInRight,
  FadeOutRight,
  Layout,
} from "react-native-reanimated"

import { Text } from "@/components/Text"
import { AuthResponse, User } from "@/interface/auth"
import { authService } from "@/services/authService"
import { colors } from "@/theme/colors"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { persistTokens } from "@/utils/storage/auth"
import { toast } from "@/utils/toast"

import { AppBottomSheet, BottomSheetController } from "./AppBottomSheet"
import { Icon, PressableIcon } from "./Icon"
import { PasswordMeter } from "./PasswordMeter"
import { TextField } from "./TextField"
import { SvgXml } from "react-native-svg"
// ...

export interface AuthSheetProps {
  /** Optional style override for the sheet’s inner content */
  style?: StyleProp<ViewStyle>
  /** Controls presentation of the sheet */
  visible: boolean
  /** Called with the authenticated user */
  onAuthenticated: (user: User) => void
  /** Called when user dismisses without authenticating */
  onCanceled: () => void
  /** iOS-only Apple button visibility (default: true on iOS) */
  showApple?: boolean
  /** Google OAuth client id (RN/Expo mobile client id) */
  googleClientId: string
  setAuthToken: (token: Omit<AuthResponse, "users">) => void
}

type Mode = "signin" | "signup" | "forgot:email" | "forgot:code" | "forgot:reset" | "forgot:done"

const AnimatedContainer: React.FC<React.PropsWithChildren<{ style?: any }>> = ({
  children,
  style,
}) => (
  <Animated.View
    layout={Layout.springify().damping(18).stiffness(180)}
    entering={FadeInDown.duration(300)}
    exiting={FadeOutDown.duration(200)}
    style={style}
  >
    {children}
  </Animated.View>
)
const StaggerItem = memo(({ index, children }: React.PropsWithChildren<{ index: number }>) => (
  <Animated.View
    entering={FadeInDown.delay(80 * index).duration(380)}
    exiting={FadeOutDown.duration(160)}
  >
    {children}
  </Animated.View>
))
StaggerItem.displayName = "StaggerItem"

type SignInProps = {
  showApple: boolean
  googleRequest: any
  googlePromptAsync: () => void
  loading: null | "google" | "apple" | "email"
  identifier: string
  setIdentifier: (s: string) => void
  password: string
  setPassword: (s: string) => void
  onAppleLogin: () => void
  onEmailLogin: () => void
  switchToSignUp: () => void
  themed: any
  switchToForgotPassword: () => void
}

const SignInContent = memo((p: SignInProps) => {
  const { themed } = p
  return (
    <>
      {p.showApple && (
        <StaggerItem index={1}>
          <Apple.AppleAuthenticationButton
            buttonType={Apple.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={Apple.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={12}
            style={themed($appleBtn)}
            onPress={p.onAppleLogin}
          />
        </StaggerItem>
      )}

      <StaggerItem index={2}>
        <Pressable
          disabled={!p.googleRequest || p.loading === "google"}
          onPress={p.googlePromptAsync}
          style={themed([$btn, p.loading === "google" && $btnDisabled])}
        >
          <Image source={require("../../assets/icons/google.png")} style={$googleAuth} />
          <Text style={themed($btnText)}>
            {p.loading === "google" ? "Connecting…" : "Continue with Google"}
          </Text>
        </Pressable>
      </StaggerItem>

      <StaggerItem index={3}>
        <View style={themed($dividerRow)}>
          <View style={themed($line)} />
          <Text style={themed($dividerText)}>Or</Text>
          <View style={themed($line)} />
        </View>
      </StaggerItem>

      <StaggerItem index={4}>
        <TextField
          LeftAccessory={(props) => (
            <Icon icon="message" style={props.style} size={24} color={colors.tintInactive} />
          )}
          label="Email"
          value={p.identifier}
          onChangeText={p.setIdentifier}
          placeholder="Enter your username or email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={colors.tintInactive}
        />
      </StaggerItem>

      <StaggerItem index={5}>
        <TextField
          LeftAccessory={(props) => (
            <Icon icon="key" style={props.style} size={24} color={colors.tintInactive} />
          )}
          label="Password"
          value={p.password}
          onChangeText={p.setPassword}
          placeholder="Enter your password"
          secureTextEntry
          containerStyle={themed($input)}
          placeholderTextColor={colors.tintInactive}
        />
      </StaggerItem>

      <StaggerItem index={6}>
        <Pressable onPress={p.switchToForgotPassword}>
          <Text text="Forgot Password?" preset="readMore" style={themed($forgotPassword)} />
        </Pressable>
      </StaggerItem>

      <StaggerItem index={7}>
        <Pressable
          onPress={p.onEmailLogin}
          style={themed([$cta, p.loading === "email" && $ctaDisabled])}
        >
          <Text style={themed($ctaText)}>{p.loading === "email" ? "Signing in…" : "Sign in"}</Text>
        </Pressable>
      </StaggerItem>

      <StaggerItem index={8}>
        <View style={$createAccountContainer}>
          <Text text="Are you new to Scripscape?" style={{ textAlign: "center" }} />
          <Pressable onPress={p.switchToSignUp} style={themed($cabtn)}>
            <Text style={themed($createAccountTxt)}>Create an account</Text>
          </Pressable>
        </View>
      </StaggerItem>
    </>
  )
})
SignInContent.displayName = "SignInContent"

type SignUpProps = {
  showApple: boolean
  googleRequest: any
  googlePromptAsync: () => void
  loading: null | "google" | "apple" | "email"
  onAppleLogin: () => void
  switchToSignIn: () => void
  switchToSignUpWithEmail: () => void
  themed: any
}
const SignUpContent = memo((p: SignUpProps) => {
  const { themed } = p
  return (
    <>
      {p.showApple && (
        <StaggerItem index={1}>
          <Apple.AppleAuthenticationButton
            buttonType={Apple.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={themed($appleBtn)}
            onPress={p.onAppleLogin}
          />
        </StaggerItem>
      )}

      <StaggerItem index={2}>
        <Pressable
          disabled={!p.googleRequest || p.loading === "google"}
          onPress={p.googlePromptAsync}
          style={themed([$btn, p.loading === "google" && $btnDisabled])}
        >
          <Image source={require("../../assets/icons/google.png")} style={$googleAuth} />
          <Text style={themed($btnText)}>
            {p.loading === "google" ? "Connecting…" : "Sign up with Google"}
          </Text>
        </Pressable>
      </StaggerItem>

      <StaggerItem index={3}>
        <View style={themed($dividerRow)}>
          <View style={themed($line)} />
          <Text style={themed($dividerText)}>Or</Text>
          <View style={themed($line)} />
        </View>
      </StaggerItem>

      <StaggerItem index={4}>
        <Pressable style={themed($cta)} onPress={p.switchToSignUpWithEmail}>
          <Text style={themed($ctaText)}>Sign up with email</Text>
        </Pressable>
      </StaggerItem>

      <StaggerItem index={5}>
        <Text style={themed($legal)}>
          By signing up, you agree to our {"\n"}
          <Text
            style={themed($legalLink)}
            onPress={() => Linking.openURL(TERMS_URL)}
            accessibilityRole="link"
          >
            Terms of Use
          </Text>{" "}
          and{" "}
          <Text
            style={themed($legalLink)}
            onPress={() => Linking.openURL(PRIVACY_URL)}
            accessibilityRole="link"
          >
            Privacy Policy
          </Text>
        </Text>
      </StaggerItem>

      <StaggerItem index={6}>
        <View style={$createAccountContainer}>
          <Text text="Already have an account?" style={{ textAlign: "center" }} />
          <Pressable onPress={p.switchToSignIn} style={themed($cabtn)}>
            <Text style={themed($createAccountTxt)}>Sign in</Text>
          </Pressable>
        </View>
      </StaggerItem>
    </>
  )
})
SignUpContent.displayName = "SignUpContent"

type CreateAccountProps = {
  showApple: boolean
  googleRequest: any
  googlePromptAsync: () => void
  loading: null | "google" | "apple" | "email"
  onAppleLogin: () => void
  switchToSignIn: () => void
  themed: any
  onEmailLogin: () => void
  switchToSignUpWithEmail: () => void
}

const CreateAccountContent = memo((p: CreateAccountProps) => {
  const {
    themed,
    showApple,
    onAppleLogin,
    googlePromptAsync,
    googleRequest,
    loading,
    switchToSignIn,
    onEmailLogin,
    switchToSignUpWithEmail,
  } = p
  return (
    <>
      {" "}
      {showApple && (
        <StaggerItem index={1}>
          {" "}
          <Apple.AppleAuthenticationButton
            buttonType={Apple.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={themed($appleBtn)}
            onPress={onAppleLogin}
          />{" "}
        </StaggerItem>
      )}{" "}
      <StaggerItem index={2}>
        {" "}
        <Pressable
          disabled={!googleRequest || loading === "google"}
          onPress={() => googlePromptAsync()}
          style={themed([$btn, loading === "google" && $btnDisabled])}
        >
          {" "}
          <Image source={require("../../assets/icons/google.png")} style={$googleAuth} />{" "}
          <Text style={themed($btnText)}>
            {" "}
            {loading === "google" ? "Connecting…" : "Sign up with Google"}{" "}
          </Text>{" "}
        </Pressable>{" "}
      </StaggerItem>{" "}
      <StaggerItem index={3}>
        {" "}
        <View style={themed($dividerRow)}>
          {" "}
          <View style={themed($line)} /> <Text style={themed($dividerText)}>Or</Text>{" "}
          <View style={themed($line)} />{" "}
        </View>{" "}
      </StaggerItem>{" "}
      <StaggerItem index={4}>
        {" "}
        <Pressable
          onPress={switchToSignUpWithEmail}
          style={themed([$cta, loading === "email" && $ctaDisabled])}
        >
          {" "}
          <Text style={themed($ctaText)}>{"Sign up with email "}</Text>{" "}
        </Pressable>{" "}
      </StaggerItem>{" "}
      <StaggerItem index={5}>
        {" "}
        <View>
          {" "}
          <Text style={themed($legal)}>
            {" "}
            By signing up, you agree to our {"\n"}{" "}
            <Text
              style={themed($legalLink)}
              onPress={() => Linking.openURL(TERMS_URL)}
              accessibilityRole="link"
            >
              {" "}
              {"Terms of Use "}{" "}
            </Text>{" "}
            {"and "}{" "}
            <Text
              style={themed($legalLink)}
              onPress={() => Linking.openURL(PRIVACY_URL)}
              accessibilityRole="link"
            >
              {" "}
              Privacy Policy{" "}
            </Text>{" "}
          </Text>{" "}
        </View>{" "}
      </StaggerItem>{" "}
      <StaggerItem index={6}>
        {" "}
        <View style={$createAccountContainer}>
          {" "}
          <Text text="Are you new to Scripscape?" style={{ textAlign: "center" }} />{" "}
          <Pressable onPress={switchToSignIn} style={themed($cabtn)}>
            {" "}
            <Text style={themed($createAccountTxt)}>Sign in</Text>{" "}
          </Pressable>{" "}
        </View>{" "}
      </StaggerItem>{" "}
    </>
  )
})

CreateAccountContent.displayName = "CreateAccountContent"

const TERMS_URL = "http://scripscape.com/terms-of-use"
const PRIVACY_URL = "http://scripscape.com/privacy-policy"

const LeftAccessoryMessageIcon = memo((props: any) => (
  <Icon icon="message" style={props.style} size={24} color={colors.tintInactive} />
))
LeftAccessoryMessageIcon.displayName = "LeftAccessoryMessageIcon"

const LeftAccessoryKeyIcon = memo((props: any) => (
  <Icon icon="key" style={props.style} size={24} color={colors.tintInactive} />
))
LeftAccessoryKeyIcon.displayName = "LeftAccessoryKeyIcon"

const validateEmail = (v: string) => {
  if (!v) return "Email is required"
  // Simple email regex, good enough for client-side
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email address"
  return undefined
}

const validatePassword = (v: string) => {
  if (v.length < 8) return "Password must be at least 8 characters"
  if (!/[A-Z]/.test(v)) return "Must include at least one uppercase letter"
  if (!/[a-z]/.test(v)) return "Must include at least one lowercase letter"
  if (!/[0-9]/.test(v)) return "Must include at least one number"
  if (!/[!@#$%^&*]/.test(v)) return "Must include at least one special character"
  return undefined
}

export const AuthSheet = (props: AuthSheetProps) => {
  const {
    style,
    visible,
    onAuthenticated,
    onCanceled,
    googleClientId,
    showApple = Platform.OS === "ios",
  } = props
  const { themed } = useAppTheme()
  const $styles = [themed($container), style]
  const [mode, setMode] = useState<Mode>("signin")
  const [createAccountMode, setCreateAccountMode] = useState<"socials" | "email-password">(
    "socials",
  )

  const sheetRef = useRef<BottomSheetController>(null)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState<null | "google" | "apple" | "email" | "signup" | "forgot">(
    null,
  )
  const [showPlainPassword, setShowPlainPassword] = useState(false)

  // Forgot password state
  const [resetEmail, setResetEmail] = useState("")
  const [resendIn, setResendIn] = useState(0) // seconds
  const [resetCode, setResetCode] = useState("")

  // ----- Google (ID token flow) -----

  const redirectUri = makeRedirectUri({
    // optional: explicitly set the native URI
    native: `${Application.applicationId}:/oauthredirect`,
  })
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    // clientId: googleClientId,
    iosClientId: "332271036639-mlae4nf7as8967n06gqcmcb90o4g3l0l.apps.googleusercontent.com",
    androidClientId: googleClientId,
    redirectUri,
  })

  // useEffect(() => {
  //   if (visible) sheetRef.current?.expand()
  // }, [visible])

  useEffect(() => {
    ;(async () => {
      if (googleResponse?.type === "success") {
        const { id_token } = googleResponse.params as any
        if (!id_token) return
        setLoading("google")
        try {
          const response = await authService.loginWithGoogle(id_token)

          if (response.ok) {
            const { user, accessToken, refreshToken, tokenType, expiresIn } = response.data
            await persistTokens({
              accessToken,
              refreshToken,
              tokenType,
              accessTokenExpires: expiresIn,
            })
            onAuthenticated(user)
          } else {
            toast.error(response.problem.message as string)
          }
        } catch (e) {
          console.warn("Google auth failed", e)
        } finally {
          setLoading(null)
        }
      }
    })()
  }, [googleResponse])

  // ----- Present/Dismiss control -----
  useEffect(() => {
    if (visible) sheetRef.current?.expand()
    else sheetRef.current?.close()
  }, [visible])

  const handleDismiss = () => {
    if (!visible) return
    onCanceled()
  }

  // ----- Email/Password -----
  const onEmailLogin = async () => {
    setLoading("email")
    try {
      const response = await authService.login(identifier.trim(), password)
      if (response.ok) {
        const { user, accessToken, refreshToken, tokenType, expiresIn } = response.data
        await persistTokens({
          accessToken,
          refreshToken,
          tokenType,
          accessTokenExpires: expiresIn,
        })
        onAuthenticated(user)
      } else {
        toast.error(response.problem.message as string, response.problem.message)
      }
    } catch (e) {
      console.warn("Email login failed", e)
    } finally {
      setLoading(null)
    }
  }
  const onEmailSignUp = async (payload: { username: string; password: string; email: string }) => {
    setLoading("signup")
    try {
      const response = await authService.signUpWithEmailPassword(payload)
      if (response.ok) {
        toast.success(response.data.message)
        setMode("signin")
      } else {
        toast.error(response.problem.message as string, "Error")
      }
    } catch (e) {
      console.warn("Email login failed", e)
    } finally {
      setLoading(null)
    }
  }

  // ----- Apple -----
  const onAppleLogin = async () => {
    try {
      setLoading("apple")
      const cred = await Apple.signInAsync({
        requestedScopes: [
          Apple.AppleAuthenticationScope.FULL_NAME,
          Apple.AppleAuthenticationScope.EMAIL,
        ],
      })
      if (!cred.identityToken) throw new Error("No identityToken from Apple")
      const response = await authService.loginWithApple(cred.identityToken)
      if (response.ok) {
        const { user, accessToken, refreshToken, tokenType, expiresIn } = response.data
        await persistTokens({
          accessToken,
          refreshToken,
          tokenType,
          accessTokenExpires: expiresIn,
        })
        onAuthenticated(user)
      } else {
        toast.error(response.problem.message as string)
      }
    } catch (e: any) {
      if (e?.code !== "ERR_CANCELED") console.warn("Apple auth failed", e)
    } finally {
      setLoading(null)
    }
  }

  const switchToSignIn = () => setMode("signin")
  const switchToSignUpWithEmail = () => setCreateAccountMode("email-password")

  const xml = `<svg xmlns="http://www.w3.org/2000/svg" width="316" height="317" viewBox="0 0 316 317" fill="none">
<circle cx="158" cy="158.5" r="125.5" stroke="url(#paint0_radial_1579_10669)" stroke-opacity="0.09" stroke-width="65"/>
<defs>
<radialGradient id="paint0_radial_1579_10669" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(158 158.5) rotate(92.283) scale(126.195)">
<stop stop-color="#FFF5C8"/>
<stop offset="0.774038" stop-color="#FFF5C8"/>
<stop offset="1" stop-color="#FFF5C8" stop-opacity="0"/>
</radialGradient>
</defs>
</svg>`

  const lockXml = `<svg xmlns="http://www.w3.org/2000/svg" width="74" height="75" viewBox="0 0 74 75" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M35.4584 9.75004C23.4026 9.75004 16.0535 10.0815 11.7938 10.3975C9.82204 10.5425 8.47925 11.8575 8.28654 13.6859C7.98591 16.5488 7.70841 20.7868 7.70841 26.7084C7.70841 32.6299 7.98437 36.8649 8.28654 39.7308C8.47925 41.5592 9.82204 42.8743 11.7954 43.0192C16.0535 43.3353 23.4026 43.6667 35.4584 43.6667C36.517 43.6667 37.5397 43.6641 38.5263 43.659C39.3441 43.6549 40.13 43.9758 40.7111 44.5512C41.2922 45.1265 41.621 45.9092 41.6251 46.7269C41.6292 47.5447 41.3082 48.3306 40.7329 48.9117C40.1575 49.4928 39.3749 49.8216 38.5572 49.8257C37.5602 49.8308 36.5273 49.8334 35.4584 49.8334C23.2977 49.8334 15.7914 49.4988 11.339 49.1705C6.53366 48.8143 2.67487 45.3101 2.15379 40.3783C1.82541 37.2734 1.54175 32.8195 1.54175 26.7084C1.54175 20.5972 1.82541 16.1433 2.15379 13.0384C2.67487 8.10663 6.53212 4.60242 11.339 4.24629C15.7914 3.91792 23.2977 3.58337 35.4584 3.58337C47.6191 3.58337 55.1255 3.91792 59.5778 4.24629C64.3832 4.60242 68.242 8.10663 68.763 13.0384C69.0914 16.1433 69.3751 20.5972 69.3751 26.7084C69.3751 28.4042 69.3535 29.969 69.3134 31.4151C69.278 32.2228 68.9268 32.9844 68.3354 33.5357C67.7439 34.087 66.9596 34.3839 66.1513 34.3625C65.3431 34.341 64.5756 34.003 64.0141 33.4211C63.4527 32.8393 63.1423 32.0602 63.1498 31.2517C63.1889 29.8642 63.2084 28.3497 63.2084 26.7084C63.2084 20.7868 62.9325 16.5519 62.6303 13.6859C62.4376 11.8575 61.0948 10.5425 59.1215 10.3975C54.8634 10.0815 47.5142 9.75004 35.4584 9.75004ZM18.5001 19.7709C20.34 19.7709 22.1046 20.5018 23.4056 21.8028C24.7067 23.1039 25.4376 24.8684 25.4376 26.7084C25.4376 28.5483 24.7067 30.3129 23.4056 31.6139C22.1046 32.915 20.34 33.6459 18.5001 33.6459C16.6601 33.6459 14.8956 32.915 13.5945 31.6139C12.2935 30.3129 11.5626 28.5483 11.5626 26.7084C11.5626 24.8684 12.2935 23.1039 13.5945 21.8028C14.8956 20.5018 16.6601 19.7709 18.5001 19.7709ZM42.3959 26.7084C42.3959 24.8684 41.665 23.1039 40.364 21.8028C39.0629 20.5018 37.2984 19.7709 35.4584 19.7709C33.6185 19.7709 31.8539 20.5018 30.5529 21.8028C29.2518 23.1039 28.5209 24.8684 28.5209 26.7084C28.5209 28.5483 29.2518 30.3129 30.5529 31.6139C31.8539 32.915 33.6185 33.6459 35.4584 33.6459C37.2984 33.6459 39.0629 32.915 40.364 31.6139C41.665 30.3129 42.3959 28.5483 42.3959 26.7084ZM52.4167 19.7709C54.2567 19.7709 56.0213 20.5018 57.3223 21.8028C58.6233 23.1039 59.3542 24.8684 59.3542 26.7084C59.3542 28.5483 58.6233 30.3129 57.3223 31.6139C56.0213 32.915 54.2567 33.6459 52.4167 33.6459C50.5768 33.6459 48.8122 32.915 47.5112 31.6139C46.2102 30.3129 45.4792 28.5483 45.4792 26.7084C45.4792 24.8684 46.2102 23.1039 47.5112 21.8028C48.8122 20.5018 50.5768 19.7709 52.4167 19.7709ZM57.0417 36.7292C54.5354 36.7292 52.1255 37.6946 50.3122 39.4249C48.499 41.1551 47.4219 43.5173 47.3046 46.0208L47.1766 48.7558C44.0948 49.5297 41.9041 52.0657 41.7268 55.462C41.655 56.9249 41.6211 58.3895 41.6251 59.8542C41.6251 61.8584 41.6852 63.4448 41.7731 64.6935C42.0305 68.3704 44.7701 70.8895 48.3082 71.1531C50.2615 71.3011 53.0627 71.4167 57.0417 71.4167C61.0208 71.4167 63.822 71.3011 65.7768 71.1546C69.3134 70.8895 72.0514 68.3704 72.3104 64.6935C72.3983 63.4448 72.4584 61.8599 72.4584 59.8542C72.4584 57.8485 72.3983 56.2637 72.3104 55.0149C72.0807 51.7404 69.8823 49.3848 66.9053 48.7203L66.7789 46.0208C66.6616 43.5173 65.5845 41.1551 63.7713 39.4249C61.958 37.6946 59.548 36.7292 57.0417 36.7292ZM57.0417 48.2917C58.3984 48.2917 59.6179 48.3056 60.714 48.3287L60.6184 46.3091C60.5718 45.392 60.1746 44.5278 59.5089 43.8952C58.8433 43.2626 57.9601 42.9098 57.0417 42.9098C56.1234 42.9098 55.2402 43.2626 54.5746 43.8952C53.9089 44.5278 53.5117 45.392 53.4651 46.3091L53.3695 48.3287C54.4672 48.3056 55.6866 48.2917 57.0417 48.2917ZM57.0417 55.2292C57.8595 55.2292 58.6438 55.5541 59.222 56.1323C59.8002 56.7105 60.1251 57.4948 60.1251 58.3125V61.3959C60.1251 62.2136 59.8002 62.9979 59.222 63.5761C58.6438 64.1544 57.8595 64.4792 57.0417 64.4792C56.224 64.4792 55.4397 64.1544 54.8615 63.5761C54.2833 62.9979 53.9584 62.2136 53.9584 61.3959V58.3125C53.9584 57.4948 54.2833 56.7105 54.8615 56.1323C55.4397 55.5541 56.224 55.2292 57.0417 55.2292Z" fill="white"/>
</svg>`

  const header = useMemo(() => {
    switch (mode) {
      case "signin":
        return {
          title: "Sign in",
          subtitle: undefined,
          onBack: undefined as (() => void) | undefined,
        }
      case "signup":
        if (createAccountMode === "socials")
          return { title: "Create an account", subtitle: "Choose a sign-up method" }
        return {
          title: "Create an account",
          subtitle: "Use your email and a password",
          onBack: () => setCreateAccountMode("socials"),
        }
      case "forgot:email":
        return {
          title: "Forgot password",
          subtitle: "We’ll send a verification code",
          onBack: () => setMode("signin"),
        }
      case "forgot:code":
        return {
          title: "Verification code",
          subtitle: "Enter the 6-digit code",
          onBack: () => setMode("forgot:email"),
        }
      case "forgot:reset":
        return {
          title: "Reset password",
          subtitle: "Create a new password",
          onBack: () => setMode("forgot:code"),
        }
      case "forgot:done":
        return { title: "All set!", subtitle: "Your password was updated", onBack: undefined }
      default:
        return { title: "", subtitle: undefined, onBack: undefined }
    }
  }, [mode, createAccountMode])

  const CreateEmailPasswordAccount = (props: {
    loading: boolean
    onSignUp: (identifier: { email: string; password: string; username: string }) => void
  }) => {
    const [signupPassword, setSignupPassword] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [showPassword, setShowPassword] = useState(showPlainPassword)

    // track which fields user touched
    const [touched, setTouched] = useState<{
      username?: boolean
      email?: boolean
      password?: boolean
    }>({})

    const validateUsername = (v: string) => {
      if (v.trim().length < 6) return "Username must be at least 6 characters"
      if (!/^[a-z0-9_]+$/i.test(v)) return "Cannot include spaces or special characters"
      return undefined
    }

    const usernameError = useMemo(() => validateUsername(username), [username])
    const emailError = useMemo(() => validateEmail(email), [email])
    const passwordError = useMemo(() => validatePassword(signupPassword), [signupPassword])

    // all conditions met = form valid
    const canSubmit = !usernameError && !emailError && !passwordError

    return (
      <>
        <StaggerItem index={0}>
          <View>
            <TextField
              LeftAccessory={(props) => (
                <Icon icon="person" style={props.style} size={24} color={colors.tintInactive} />
              )}
              label="username"
              placeholderTextColor={colors.tintInactive}
              status={touched.username && usernameError ? "error" : undefined}
              helper={touched.username ? usernameError : undefined}
              placeholder="Enter your username"
              onChangeText={(text) => {
                setTouched((t) => ({ ...t, username: true }))
                setUsername(text)
              }}
              autoCapitalize="none"
            />
          </View>
        </StaggerItem>
        <StaggerItem index={1}>
          <View style={$inputContainer}>
            <TextField
              LeftAccessory={LeftAccessoryMessageIcon}
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter your email"
              placeholderTextColor={colors.tintInactive}
              status={touched.email && emailError ? "error" : undefined}
              helper={touched.email ? emailError : undefined}
              onChangeText={(txt) => {
                setEmail(txt)
                setTouched((t) => ({ ...t, email: true }))
              }}
            />
          </View>
        </StaggerItem>
        <StaggerItem index={2}>
          <View style={$inputContainer}>
            <TextField
              LeftAccessory={(props) => (
                <Icon icon="key" style={props.style} size={24} color={colors.tintInactive} />
              )}
              label="Password"
              secureTextEntry={showPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.tintInactive}
              onChangeText={setSignupPassword}
              RightAccessory={(props) => (
                <PressableIcon
                  icon={showPassword ? "eye" : "hide"}
                  onPress={() => setShowPassword(!showPassword)}
                  style={props.style}
                  size={24}
                  color={colors.tintInactive}
                />
              )}
            />
          </View>
          <PasswordMeter password={signupPassword} />
        </StaggerItem>

        <StaggerItem index={3}>
          <Pressable
            disabled={!canSubmit || props.loading}
            style={[themed($cta), (!canSubmit || !!props.loading) && { opacity: 0.5 }]}
            onPress={() => {
              props.onSignUp({ email, password: signupPassword, username })
            }}
          >
            {props.loading ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ActivityIndicator />
                <Text style={themed($ctaText)}>Creating…</Text>
              </View>
            ) : (
              <Text style={themed($ctaText)}>Sign Up</Text>
            )}
          </Pressable>
        </StaggerItem>
        <StaggerItem index={5}>
          <View>
            <Text style={themed($legal)}>
              By signing up, you agree to our {"\n"}
              <Text
                style={themed($legalLink)}
                onPress={() => Linking.openURL(TERMS_URL)}
                accessibilityRole="link"
              >
                {"Terms of Use "}
              </Text>
              {"and "}
              <Text
                style={themed($legalLink)}
                onPress={() => Linking.openURL(PRIVACY_URL)}
                accessibilityRole="link"
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </StaggerItem>

        <StaggerItem index={7}>
          <View style={$createAccountContainer}>
            <Text text="Already have an account?" style={{ textAlign: "center" }} />
            <Pressable onPress={switchToSignIn} style={themed($cabtn)}>
              <Text style={themed($createAccountTxt)}>Sign in</Text>
            </Pressable>
          </View>
        </StaggerItem>
      </>
    )
  }

  const ForgotEmailContent = memo(({ themed, onCancel }: any) => {
    const [email, setEmail] = useState(resetEmail)
    const [loadingForgotEmail, setLoadingForgotEmail] = useState(false)

    const emailError = useMemo(() => validateEmail(email), [email])

    const onSendVerificationCode = async () => {
      setLoadingForgotEmail(true)
      try {
        const response = await authService.forgotPassword(email)
        if (response.ok) {
          const { message } = response.data
          toast.success(message)
          setResendIn(60)
          setMode("forgot:code")
        } else {
          toast.error(response.problem.message as string, response.problem.message)
        }
      } catch (e) {
        console.warn("Error sending forgot email", e)
      } finally {
        setLoadingForgotEmail(false)
        setResetEmail(email)
      }
    }

    return (
      <>
        <StaggerItem index={2}>
          <Text preset="description" style={themed($description)}>
            Please fill in your email address below, to get your verification code.
          </Text>
        </StaggerItem>

        <StaggerItem index={3}>
          <TextField
            LeftAccessory={LeftAccessoryMessageIcon}
            label="Email"
            value={email}
            helper={email.length > 0 ? emailError : undefined}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Enter your email"
            status={emailError ? "error" : undefined}
            placeholderTextColor={colors.tintInactive}
            autoFocus
          />
        </StaggerItem>

        <StaggerItem index={4}>
          <Pressable
            style={[themed($cta), (loadingForgotEmail || emailError) && $btnDisabled]}
            onPress={onSendVerificationCode}
          >
            <Text style={themed($ctaText)}>
              {" "}
              {loadingForgotEmail ? "Sending..." : "Send verification code"}
            </Text>
          </Pressable>
        </StaggerItem>

        <StaggerItem index={5}>
          <Pressable onPress={onCancel} style={themed($cabtn)}>
            <Text style={themed($createAccountTxt)}>Back to sign in</Text>
          </Pressable>
        </StaggerItem>
      </>
    )
  })
  ForgotEmailContent.displayName = "ForgotEmailContent"

  const ForgotCodeContent = memo(({ themed, onBack, onVerify, waiting }: any) => {
    const [code, setCode] = useState("")
    const [loadingReset, setLoadingReset] = useState(false)

    async function resend() {
      if (resendIn > 0) return
      const response = await authService.forgotPassword(resetEmail)
      if (response.ok) {
        const { message } = response.data
        toast.success(message)
      } else {
        toast.error(response.problem.message as string, response.problem.message)
      }
      setResendIn(30)
    }

    const onVerifyVerificationCode = async () => {
      setLoadingReset(true)
      try {
        const response = await authService.verifyCode(resetEmail, code)
        if (response.ok) {
          console.log(response.data)
          const { message } = response.data
          toast.success(message)
          setMode("forgot:reset")
          setResetCode(code)
        } else {
          toast.error(response.problem.message as string, response.problem.message)
        }
      } catch (e) {
        console.warn("Error  verifying code", e)
      } finally {
        setLoadingReset(false)
      }
    }
    return (
      <>
        <StaggerItem index={2}>
          <Text preset="description" style={themed($description)}>
            We have sent the code to your email <Text style={themed($legalLink)}>{resetEmail}</Text>
            Please enter the code below.
          </Text>
        </StaggerItem>

        <StaggerItem index={3}>
          <View style={$phoneInputContainer}>
            <OtpInput
              numberOfDigits={6}
              onTextChange={(text) => setCode(text)}
              textInputProps={{
                accessibilityLabel: "One-Time Password",
                style: {
                  color: colors.text,
                },
              }}
              theme={{ pinCodeTextStyle: themed($pinCodeTextStyle) }}
              onFilled={(text) => onVerify(text)}
            />
          </View>
        </StaggerItem>

        <StaggerItem index={4}>
          <Pressable
            style={themed($cta)}
            onPress={() => {
              onVerifyVerificationCode()
              setResetCode(code)
            }}
          >
            <Text style={themed($ctaText)}>Verify code</Text>
          </Pressable>
        </StaggerItem>

        <StaggerItem index={5}>
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <Text style={themed($description)}>
              Didn’t get the code?{" "}
              <Text style={themed($legalLink)} onPress={resend} accessibilityRole="button">
                {waiting > 0 ? `Resend in ${waiting}s` : "Resend code"}
              </Text>
            </Text>
          </View>
        </StaggerItem>

        <StaggerItem index={6}>
          <Pressable onPress={onBack} style={themed($cabtn)}>
            <Text style={themed($createAccountTxt)}>Back</Text>
          </Pressable>
        </StaggerItem>
      </>
    )
  })
  ForgotCodeContent.displayName = "ForgotCodeContent"
  const RULES = [
    { id: "len8", label: "Minimum 8 characters", test: (s: string) => s.length >= 8 },
    { id: "upper", label: "1 uppercase letter", test: (s: string) => /[A-Z]/.test(s) },
    { id: "num", label: "At least 1 number", test: (s: string) => /\d/.test(s) },
    {
      id: "spec",
      label: "At least 1 special character",
      test: (s: string) => /[^A-Za-z0-9]/.test(s),
    },
  ] as const

  const ForgotResetContent = memo(({ themed, onBack, onSubmit }: any) => {
    const [resetPassword, setResetPassword] = useState("")
    const [confirmResetPassword, setConfirmResetPassword] = useState("")
    const [touched, setTouched] = useState(false)
    const [showPlainPassword, setShowPlainPassword] = useState(false)

    const ruleResults = useMemo(
      () => RULES.map((r) => [r.id, r.test(resetPassword)] as const),
      [resetPassword],
    )
    const allRulesMet = useMemo(() => ruleResults.every(([, ok]) => ok), [ruleResults])

    const passwordMismatch =
      touched && confirmResetPassword.length > 0 && resetPassword !== confirmResetPassword

    const canSubmit =
      resetPassword.length > 0 &&
      confirmResetPassword.length > 0 &&
      allRulesMet &&
      !passwordMismatch

    const updatePassword = async () => {
      // setLoadingReset(true)
      try {
        const response = await authService.updatePassword(resetPassword, resetCode)
        if (response.ok) {
          const { message } = response.data
          toast.success(message)
          setMode("forgot:done")
        } else {
          toast.error(response.problem.message as string, response.problem.message)
        }
      } catch (e) {
        console.warn("Error  verifying code", e)
      } finally {
        // setLoadingReset(false)
      }
    }

    return (
      <>
        <StaggerItem index={2}>
          <TextField
            LeftAccessory={LeftAccessoryKeyIcon}
            label="New Password"
            value={resetPassword}
            onChangeText={(txt) => {
              setResetPassword(txt)
              if (!touched) setTouched(true)
            }}
            secureTextEntry={!showPlainPassword}
            placeholder="Enter your new password"
            placeholderTextColor={colors.tintInactive}
            RightAccessory={(props) => (
              <PressableIcon
                icon={showPlainPassword ? "eye" : "hide"}
                onPress={() => setShowPlainPassword(!showPlainPassword)}
                style={props.style}
                size={24}
                color={colors.tintInactive}
              />
            )}
          />
          <PasswordMeter password={resetPassword} />
        </StaggerItem>

        <StaggerItem index={3}>
          <View style={$confirmPasswordContainer}>
            <TextField
              LeftAccessory={LeftAccessoryKeyIcon}
              label="Confirm Password"
              value={confirmResetPassword}
              onChangeText={(txt) => {
                setConfirmResetPassword(txt)
                if (!touched) setTouched(true)
              }}
              secureTextEntry={!showPlainPassword}
              placeholder="Re-enter your new password"
              placeholderTextColor={colors.tintInactive}
              status={passwordMismatch ? "error" : undefined}
              helper={passwordMismatch ? "Passwords do not match" : undefined}
              RightAccessory={(props) => (
                <PressableIcon
                  icon={showPlainPassword ? "eye" : "hide"}
                  onPress={() => setShowPlainPassword(!showPlainPassword)}
                  style={props.style}
                  size={24}
                  color={colors.tintInactive}
                />
              )}
            />
          </View>
        </StaggerItem>

        <StaggerItem index={4}>
          <Pressable
            style={[themed($cta), !canSubmit && themed($ctaDisabled)]}
            disabled={!canSubmit}
            onPress={() => {
              if (!canSubmit) return
              updatePassword()
            }}
          >
            <Text style={themed($ctaText)}>Reset Password</Text>
          </Pressable>
        </StaggerItem>

        <StaggerItem index={5}>
          <Pressable onPress={onBack} style={themed($cabtn)}>
            <Text style={themed($createAccountTxt)}>Back</Text>
          </Pressable>
        </StaggerItem>
      </>
    )
  })

  ForgotResetContent.displayName = "ForgotResetContent"

  const ForgotDoneContent = memo(({ themed, onSignIn }: any) => (
    <>
      <StaggerItem index={1}>
        <View style={{ alignItems: "center", gap: 8 }}>
          <SvgXml xml={xml} />
          <View style={$lockLog}>
            <SvgXml xml={lockXml} />
          </View>
          <Text preset="contentTitle" style={themed($title)}>
            Your password has been reset successfully
          </Text>
          <Text preset="description" style={themed($description)}>
            Great, your new password is set.
          </Text>
        </View>
      </StaggerItem>

      <StaggerItem index={2}>
        <Pressable style={themed($cta)} onPress={onSignIn}>
          <Text style={themed($ctaText)}>Sign in</Text>
        </Pressable>
      </StaggerItem>
    </>
  ))
  ForgotDoneContent.displayName = "ForgotDoneContent"

  return (
    <AppBottomSheet
      controllerRef={sheetRef}
      snapPoints={["90%"]}
      onChange={(index) => {
        if (index === -1) onCanceled()
      }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <AnimatedContainer style={$styles}>
          <StaggerItem index={0}>
            <View style={{ alignItems: "center", marginBottom: 8 }}>
              {/* Back button only when header.onBack exists */}
              {!!header.onBack && (
                <Pressable
                  onPress={header.onBack}
                  style={{ position: "absolute", left: 0, padding: 8 }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                  <Icon icon="arrowLeft" size={24} color={colors.tintInactive} />
                </Pressable>
              )}

              <Text preset="contentTitle" style={themed($title)}>
                {header.title}
              </Text>

              {/* {!!header.subtitle && <Text style={themed($subtitle)}>{header.subtitle}</Text>} */}
            </View>
          </StaggerItem>
          <Animated.View
            key={mode}
            entering={
              mode.startsWith("forgot")
                ? FadeInRight.duration(260)
                : mode === "signin"
                  ? FadeInLeft.duration(260)
                  : FadeInRight.duration(260)
            }
            exiting={
              mode.startsWith("forgot")
                ? FadeOutLeft.duration(220)
                : mode === "signin"
                  ? FadeOutRight.duration(220)
                  : FadeOutLeft.duration(220)
            }
          >
            {mode === "signin" ? (
              <SignInContent
                showApple={showApple}
                googleRequest={googleRequest}
                googlePromptAsync={() => googlePromptAsync()}
                loading={loading}
                identifier={identifier}
                setIdentifier={setIdentifier}
                password={password}
                setPassword={setPassword}
                onAppleLogin={onAppleLogin}
                onEmailLogin={onEmailLogin}
                switchToSignUp={() => setMode("signup")}
                switchToForgotPassword={() => setMode("forgot:email")}
                themed={themed}
              />
            ) : mode === "signup" && createAccountMode === "socials" ? (
              <SignUpContent
                showApple={showApple}
                googleRequest={googleRequest}
                googlePromptAsync={() => googlePromptAsync()}
                loading={loading}
                onAppleLogin={onAppleLogin}
                switchToSignIn={() => setMode("signin")}
                themed={themed}
                switchToSignUpWithEmail={switchToSignUpWithEmail}
              />
            ) : mode === "signup" && createAccountMode === "email-password" ? (
              <CreateEmailPasswordAccount onSignUp={onEmailSignUp} loading={loading === "signup"} />
            ) : mode === "forgot:email" ? (
              <ForgotEmailContent
                themed={themed}
                onCancel={() => setMode("signin")}
                onNext={(email: string) => setMode("forgot:code")}
              />
            ) : mode === "forgot:code" ? (
              <ForgotCodeContent
                themed={themed}
                waiting={resendIn}
                onBack={() => setMode("forgot:email")}
                onVerify={(code) => {
                  // setResetCode(code)
                }}
              />
            ) : mode === "forgot:reset" ? (
              <ForgotResetContent
                themed={themed}
                onBack={() => setMode("forgot:code")}
                onSubmit={() => setMode("forgot:done")}
              />
            ) : (
              <ForgotDoneContent
                themed={themed}
                onSignIn={() => {
                  // clear transient state & go back
                  setMode("signin")
                }}
              />
            )}
          </Animated.View>
        </AnimatedContainer>
      </KeyboardAvoidingView>
    </AppBottomSheet>
  )
}

// ---------------- STYLES ----------------

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xxxs,
  paddingTop: spacing.md,
})

const $title: ThemedStyle<TextStyle> = ({ typography, spacing }) => ({
  fontFamily: typography.primary.bold,
  textAlign: "center",
  marginBottom: spacing.lg,
})
const $googleAuth: ImageStyle = {
  height: 24,
  width: 24,
  marginLeft: 8,
  marginRight: -8,
}

const $appleBtn: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  height: 48,
  marginBottom: spacing.xs,
  justifyContent: "space-between",
})

const $forgotPassword: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary300,
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 20,
  marginTop: 4,
})

const $btn: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 48,
  borderRadius: spacing.sm,
  borderWidth: spacing.xxxs - 1,
  borderColor: colors.palette.accentActive,
  alignItems: "center",
  marginBottom: spacing.sm,
  flexDirection: "row",
})

const $btnDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.6,
})

const $btnText: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontFamily: typography.primary.medium,
  fontSize: 16,
  color: colors.text,
  marginLeft: "auto",
  marginRight: "auto",
})

const $dividerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginVertical: spacing.md,
})

const $line: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  height: 1,
  backgroundColor: colors.palette.accentActive,
})

const $dividerText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 20,
})

const $input: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingTop: spacing.xxxs,
  paddingBottom: spacing.xxxs,
})

const $cta: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 48,
  borderRadius: spacing.sm,
  backgroundColor: colors.buttonBackground,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.md,
})
const $cabtn: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 48,
  borderRadius: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.sm + 2,
  borderWidth: 1,
  borderColor: colors.palette.accentActive,
})

const $ctaDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.7,
})

const $ctaText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 16,
  color: colors.palette.neutral100,
})

const $createAccountTxt: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.medium,
  color: colors.palette.neutral300,
  fontSize: 18,
  fontWeight: 500,
  lineHeight: 20,
})

const $createAccountContainer: ViewStyle = { marginTop: 60 }
const $description: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  textAlign: "center",
  fontSize: spacing.sm + 2,
  lineHeight: 20,
  marginBottom: spacing.lg,
})

const $legal: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: spacing.md - 1,
  color: colors.text,
  lineHeight: 24,
  fontWeight: 500,
  textAlign: "center",
  marginTop: spacing.sm,
})

const $legalLink: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.palette.primary300,
  fontFamily: typography.primary.medium,
  textDecorationStyle: "solid", // try "dotted" or "dashed" if you prefer
  textDecorationColor: colors.palette.primary300,
})

const $inputContainer: ViewStyle = {
  marginTop: 12,
}
const $phoneInputContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  width: "100%",
}
const $pinCodeTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})
const $confirmPasswordContainer: ViewStyle = {
  marginTop: 18,
}

const $lockLog: ViewStyle = {
  position: "absolute",
  top: 124,
}
