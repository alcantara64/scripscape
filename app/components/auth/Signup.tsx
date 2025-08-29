import { memo } from "react"
import { StaggerItem } from "../AnimatedContainer"
import * as Apple from "expo-apple-authentication"

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
export const SignUpContent = memo((p: SignUpProps) => {
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
