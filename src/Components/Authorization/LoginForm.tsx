import React from "react"

import {
  BlockButton,
  FormContainer,
  StyledFacebookButton,
  StyledInput as Input,
  StyledTwitterButton,
} from "./commonElements"
import { FormComponentType } from "./Types"

const LoginForm: FormComponentType = props => {
  const {
    email,
    password,
    handleChangeMode,
    handleSubmit,
    handleUpdateInput,
  } = props
  return (
    <FormContainer onSubmit={handleSubmit}>
      <StyledFacebookButton>Log in with Facebook</StyledFacebookButton>
      <StyledTwitterButton />
      <Input
        block
        value={email.value}
        placeholder="Email"
        onChange={handleUpdateInput("email")}
        error={email.error.length > 0}
        // errorMessage={email.error}
      />
      <Input
        block
        value={password.value}
        type="password"
        placeholder="Password"
        onChange={handleUpdateInput("password")}
        error={password.error.length > 0}
        // errorMessage={password.error}
      />
      <p>
        Uh oh I{" "}
        <a onClick={handleChangeMode("forgot_password")} href="#">
          Forgot My Password
        </a>
      </p>
      <BlockButton>Log In</BlockButton>
      <p>
        Don't have an account?{" "}
        <a onClick={handleChangeMode("register")} href="#">
          Sign Up
        </a>
      </p>
    </FormContainer>
  )
}

export default LoginForm
