import { memo, useEffect, useMemo, useRef, useState } from "react"
import {
  Platform,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  TextInput,
  Image,
  Linking,
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

const TERMS_URL = "https://scripscape.com/terms"
const PRIVACY_URL = "https://scripscape.com/privacy"

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
  const [loading, setLoading] = useState<null | "google" | "apple" | "email">(null)
  const [showPlainPassword, setShowPlainPassword] = useState(false)

  // Forgot password state
  const [resetEmail, setResetEmail] = useState("")
  const [code, setCode] = useState("") // 6-digit code as a string
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [resendIn, setResendIn] = useState(0) // seconds

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
    console.log({ visible })
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
        toast.error(response.problem.message as string)
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
      console.log({ cred })
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

  const switchToSignUp = () => setMode("signup")
  const switchToSignIn = () => setMode("signin")
  const switchToSignUpWithEmail = () => setCreateAccountMode("email-password")

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

  const CreateEmailPasswordAccount = () => {
    const [signupPassword, setSignupPassword] = useState("")

    return (
      <>
        {/* ----- CREATE ACCOUNT CONTENT (same sheet) ----- */}

        <StaggerItem index={0}>
          <View>
            <TextField
              LeftAccessory={(props) => (
                <Icon icon="person" style={props.style} size={24} color={colors.tintInactive} />
              )}
              label="username"
              placeholderTextColor={colors.tintInactive}
              placeholder="Enter your username"
              autoCapitalize="none"
            />
          </View>
        </StaggerItem>
        <StaggerItem index={1}>
          <View style={$inputContainer}>
            <TextField
              LeftAccessory={(props) => (
                <Icon icon="message" style={props.style} size={24} color={colors.tintInactive} />
              )}
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter your email"
              placeholderTextColor={colors.tintInactive}
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
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor={colors.tintInactive}
              onChangeText={setSignupPassword}
              RightAccessory={(props) => (
                <Icon icon="eye" style={props.style} size={24} color={colors.tintInactive} />
              )}
            />
          </View>
          <PasswordMeter password={signupPassword} />
        </StaggerItem>

        <StaggerItem index={3}>
          <Pressable style={themed($cta)} onPress={() => {}}>
            <Text style={themed($ctaText)}>Sign Up</Text>
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

  const ForgotEmailContent = memo(({ themed, onCancel, onNext }: any) => (
    <>
      <StaggerItem index={2}>
        <Text preset="description" style={themed($description)}>
          Please fill in your email address below, to get your verification code.
        </Text>
      </StaggerItem>

      <StaggerItem index={3}>
        <TextField
          LeftAccessory={(props) => (
            <Icon icon="message" style={props.style} size={24} color={colors.tintInactive} />
          )}
          label="Email"
          value={resetEmail}
          onChangeText={setResetEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Enter your email"
          placeholderTextColor={colors.tintInactive}
          autoFocus
        />
      </StaggerItem>

      <StaggerItem index={4}>
        <Pressable style={themed($cta)} onPress={onNext}>
          <Text style={themed($ctaText)}>Send verification code</Text>
        </Pressable>
      </StaggerItem>

      <StaggerItem index={5}>
        <Pressable onPress={onCancel} style={themed($cabtn)}>
          <Text style={themed($createAccountTxt)}>Back to sign in</Text>
        </Pressable>
      </StaggerItem>
    </>
  ))
  ForgotEmailContent.displayName = "ForgotEmailContent"

  const ForgotCodeContent = memo(({ themed, onBack, onVerify, onResend, waiting }: any) => (
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
        <Pressable style={themed($cta)} onPress={onVerify}>
          <Text style={themed($ctaText)}>Verify code</Text>
        </Pressable>
      </StaggerItem>

      <StaggerItem index={5}>
        <View style={{ alignItems: "center", marginTop: 8 }}>
          <Text style={themed($description)}>
            Didn’t get the code?{" "}
            <Text style={themed($legalLink)} onPress={onResend} accessibilityRole="button">
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
  ))
  ForgotCodeContent.displayName = "ForgotCodeContent"

  const ForgotResetContent = memo(({ themed, onBack, onSubmit }: any) => (
    <>
      <StaggerItem index={2}>
        <TextField
          LeftAccessory={(props) => (
            <Icon icon="key" style={props.style} size={24} color={colors.tintInactive} />
          )}
          label="New Password"
          value={newPass}
          onChangeText={setNewPass}
          secureTextEntry={showPlainPassword}
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
        {/* <PasswordMeter password={newPass} /> */}
      </StaggerItem>

      <StaggerItem index={3}>
        <View style={$confirmPasswordContainer}>
          <TextField
            LeftAccessory={(props) => (
              <Icon icon="key" style={props.style} size={24} color={colors.tintInactive} />
            )}
            label="Confirm Password"
            value={confirmPass}
            onChangeText={setConfirmPass}
            secureTextEntry={showPlainPassword}
            placeholder="Re-enter your new password"
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
        </View>
      </StaggerItem>

      <StaggerItem index={4}>
        <Pressable style={themed($cta)} onPress={onSubmit}>
          <Text style={themed($ctaText)}>Reset Password</Text>
        </Pressable>
      </StaggerItem>

      <StaggerItem index={5}>
        <Pressable onPress={onBack} style={themed($cabtn)}>
          <Text style={themed($createAccountTxt)}>Back</Text>
        </Pressable>
      </StaggerItem>
    </>
  ))
  ForgotResetContent.displayName = "ForgotResetContent"

  const ForgotDoneContent = memo(({ themed, onSignIn }: any) => (
    <>
      <StaggerItem index={1}>
        <View style={{ alignItems: "center", gap: 8 }}>
          <Icon icon="shield-check" size={56} color={colors.tintInactive} />
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
    <AppBottomSheet controllerRef={sheetRef} snapPoints={["85%"]}>
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
            <CreateEmailPasswordAccount on />
          ) : mode === "forgot:email" ? (
            <ForgotEmailContent
              themed={themed}
              onCancel={() => setMode("signin")}
              onNext={() => setMode("forgot:code")}
            />
          ) : mode === "forgot:code" ? (
            <ForgotCodeContent
              themed={themed}
              waiting={resendIn}
              onBack={() => setMode("forgot:email")}
              onVerify={() => {}}
              onResend={() => setMode("forgot:reset")}
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
                setCode("")
                setNewPass("")
                setConfirmPass("")
                setMode("signin")
              }}
            />
          )}
        </Animated.View>
      </AnimatedContainer>
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
