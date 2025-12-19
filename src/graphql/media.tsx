import { gql } from "@apollo/client";

export const ADD_MEDIA_MUTATION = gql`
  mutation createMedia($input: CreateMediaInput!, $media: Upload!) {
    createMedia(input: $input, media: $media) {
      id
      name
      downloadable_url
      collection_name
      file_name
      mime_type
      size
      uuid
      uploaded_by
      created_at
    }
  }
`;

export const DELETE_MEDIA_MUTATION = gql`
  mutation deleteMedia($id: ID!) {
    deleteMedia(id: $id) {
      id
    }
  }
`;
export interface CreateMediaInput {
  entity: String;
  entity_id: Number;
  collection_name: String;
}
