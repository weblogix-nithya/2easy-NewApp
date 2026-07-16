"use client";
// Chakra imports
import { useMutation } from "@apollo/client/react";
import { Flex, Link, useToast } from "@chakra-ui/react";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { ADD_MEDIA_MUTATION, CreateMediaResponse } from "@/graphql/media";
import { useCallback, useState } from "react";
// Assets
import { useDropzone } from "react-dropzone";

function FileInputLink(props: {
  [x: string]: any;
  entity: string;
  entityId: number;
  collection_name?: string;
  description?: string;
  media_url?: string;
  onUpload?: (downloadable_url: string) => void;
  accept?: string;
}) {
  const {
    entity,
    entityId,
    collection_name,
    _description,
    _media_url,
    onUpload,
    accept,
    ...rest
  } = props;
  // const brandColor = useColorModeValue("brand.500", "white");
  const toast = useToast();
  const [media, setMedia] = useState({ raw: null, preview: null });
  // const [isMedia, setIsMedia] = useState(media_url ? true : false);

  const [handleCreateMedia, {}] = useMutation<CreateMediaResponse, any>(
    ADD_MEDIA_MUTATION,
    {
      variables: {
        input: {
          entity: entity,
          entity_id: entityId,
          collection_name: collection_name,
        },
        media: media,
      },
      onCompleted: (data: any) => {
        toast({
          title: "Media updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        const downloadable = data?.createMedia?.downloadable_url;
        if (onUpload && downloadable) {
          onUpload(downloadable);
        }
      },
      onError: (error) => {
        showGraphQLErrorToast(error);
      },
    },
  );

  // function _isImgUrl(url: string) {
  //   return /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url);
  // }

  const onDrop = useCallback(
    (acceptedFiles: any) => {
      acceptedFiles.forEach((file: any) => {
        const reader = new FileReader();
        reader.onabort = () => console.log("file reading was aborted");
        reader.onerror = () => console.log("file reading has failed");
        reader.onload = () => {
          setMedia(file);
          // Added this because the setMedia is too slow. needs a minor delay before running handleCreateMedia.
          setTimeout(() => {
            handleCreateMedia();
          }, 500);
        };
        reader.readAsArrayBuffer(file);
      });
    },
    [handleCreateMedia],
  );

  // react-dropzone expects an `Accept` map; allow string shortcuts like "image/*"
  const acceptOption: any =
    typeof accept === "string" ? { [accept]: [] } : accept;

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptOption,
  });

  return (
    <Flex
      align="center"
      justify="center"
      w="100%"
      minH="100%"
      cursor="pointer"
      {...getRootProps({ className: "dropzone text-blue-600" })}
      {...rest}
    >
      <input {...getInputProps()} />
      <Link href="#" variant="no-effects">
        Upload
      </Link>
    </Flex>
  );
}

export default FileInputLink;
