import { gql } from "@apollo/client";

export const MUTATION_LOGIN = gql`
  mutation login($input: LoginInput) {
    login(input: $input) {
      access_token
      user {
        id
        name
        email
        state
        media {
          downloadable_url
        }
        driver {
          id
        }
        customer {
          id
          company_id
        }
        is_admin
        is_company_admin
        reset_approve
      }
    }
  }
`;

export const MUTATION_REGISTER = gql`
  mutation register($input: RegisterInput) {
    register(input: $input) {
      tokens {
        access_token
        user {
          id
          name
          email
          state
          driver {
            id
          }
          customer {
            id
            company_id
          }
          is_admin
          is_company_admin
        }
      }
    }
  }
`;

export const MUTATION_FORGOT_PASSWORD = gql`
  mutation forgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      status
    }
  }
`;

export const MUTATION_UPDATE_PASSWORD = gql`
  mutation updateForgottenPassword($input: NewPasswordWithCodeInput!) {
    updateForgottenPassword(input: $input) {
      status
    }
  }
`;

export interface LoginInput {
  username: String;
  password: String;
}

export interface RegisterInput {
  name: String;
  email: String;
  password: String;
  password_confirmation: String;
}

export interface ForgotPasswordInput {
  email: String;
}

export interface NewPasswordWithCodeInput {
  password: String;
  password_confirmation: String;
  email: String;
  token: String;
}
