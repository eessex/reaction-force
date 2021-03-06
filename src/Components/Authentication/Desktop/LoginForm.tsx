import { Flex } from "@artsy/palette"
import {
  Error,
  Footer,
  ForgotPassword,
  FormContainer as Form,
  SubmitButton,
} from "Components/Authentication/commonElements"
import {
  FormProps,
  InputValues,
  ModalType,
} from "Components/Authentication/Types"
import { LoginValidator } from "Components/Authentication/Validators"
import PasswordInput from "Components/PasswordInput"
import QuickInput from "Components/QuickInput"
import { Formik, FormikProps, useFormikContext } from "formik"
import React, { Component, useState } from "react"
import { recaptcha } from "Utils/recaptcha"

interface ConditionalOtpInputProps {
  error: string
}

const ConditionalOtpInput: React.FC<ConditionalOtpInputProps> = props => {
  const [show, setShow] = useState(false)
  const {
    errors,
    values,
    handleBlur,
    handleChange,
    setTouched,
  } = useFormikContext<InputValues>()

  if (!show && props.error === "missing two-factor authentication code") {
    setShow(true)
  }

  return (
    show && (
      <QuickInput
        block
        error={errors.otp_attempt}
        name="otp_attempt"
        placeholder="Enter an authentication code"
        value={values.otp_attempt}
        label="Authentication Code"
        onChange={handleChange}
        onBlur={handleBlur}
        setTouched={setTouched}
        touchedOnChange={false}
      />
    )
  )
}

export interface LoginFormState {
  error: string
}

export class LoginForm extends Component<FormProps, LoginFormState> {
  state = {
    error: this.props.error,
  }

  onSubmit = (values: InputValues, formikBag: FormikProps<InputValues>) => {
    recaptcha("login_submit")
    this.props.handleSubmit(values, formikBag)
  }

  render() {
    return (
      <Formik
        initialValues={this.props.values || {}}
        onSubmit={this.onSubmit}
        validationSchema={LoginValidator}
      >
        {({
          values,
          errors,
          touched,
          handleChange: formikHandleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          status,
          setStatus,
        }: FormikProps<InputValues>) => {
          const globalError =
            this.state.error || (status && !status.success && status.error)

          const handleChange = e => {
            setStatus(null)
            this.setState({ error: null })
            formikHandleChange(e)
          }

          return (
            <Form onSubmit={handleSubmit} data-test="LoginForm">
              <QuickInput
                block
                error={touched.email && errors.email}
                placeholder="Enter your email address"
                name="email"
                label="Email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoFocus
              />
              <PasswordInput
                block
                error={touched.password && errors.password}
                placeholder="Enter your password"
                name="password"
                label="Password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ConditionalOtpInput error={globalError} />
              <Flex alignItems="center" justifyContent="flex-end">
                <ForgotPassword
                  onClick={() => this.props.handleTypeChange(ModalType.forgot)}
                />
              </Flex>
              {globalError &&
                globalError !== "missing two-factor authentication code" && (
                  <Error show>{globalError}</Error>
                )}
              <SubmitButton loading={isSubmitting}>Log in</SubmitButton>
              <Footer
                handleTypeChange={() =>
                  this.props.handleTypeChange(ModalType.signup)
                }
                mode={"login" as ModalType}
                onAppleLogin={this.props.onAppleLogin}
                onFacebookLogin={this.props.onFacebookLogin}
                inline
              />
            </Form>
          )
        }}
      </Formik>
    )
  }
}
