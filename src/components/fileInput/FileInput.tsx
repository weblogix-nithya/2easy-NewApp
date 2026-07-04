"use client";
// Chakra imports
import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Center,
  Flex,
  Image,
  Link,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { showGraphQLErrorToast } from "@/components/toast/ToastError";
import { ADD_MEDIA_MUTATION, CreateMediaResponse } from "@/graphql/media";
import { useCallback, useState } from "react";
// Assets
import { useDropzone } from "react-dropzone";

function FileInput(props: {
  [x: string]: any;
  entity: string;
  entityId: number;
  collection_name?: string;
  description?: string;
  media_url?: string;
  onUpload?: (downloadable_url: string) => void;
  isTemporary?: boolean;
  onTemporaryUpload?: (temporaryFiles: any) => void;
  defaulTemporaryFiles?: any[];
}) {
  const {
    entity,
    entityId,
    collection_name,
    description,
    media_url,
    onUpload,
    isTemporary,
    onTemporaryUpload,
    defaulTemporaryFiles = [],
    ...rest
  } = props;
  // const brandColor = useColorModeValue("brand.500", "white");
  const toast = useToast();
  const [media, setMedia] = useState({ raw: null, preview: null });
  const [isMedia, _setIsMedia] = useState(media_url ? true : false);
  const [temporaryFiles, setTemporaryFiles] = useState([]);
  const [_temporaryTest, _setTemporaryTest] = useState(defaulTemporaryFiles);



  const [handleCreateMedia, { }] = useMutation<CreateMediaResponse, any>(ADD_MEDIA_MUTATION, {
    variables: {
      input: {
        entity: entity,
        entity_id: entityId,
        collection_name: collection_name,
      },
      media: media,
    },
    onCompleted: (data) => {
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
  });

  function isImgUrl(url: string) {
    return /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url);
  }
  const onDrop = useCallback(
    (acceptedFiles: any) => {
      if (!isTemporary) {
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
      } else {
        let _temporaryFiles = [...temporaryFiles];
        let _id = _temporaryFiles[_temporaryFiles.length - 1]?.id;
        acceptedFiles.forEach((file: any) => {
          _id = _id != undefined ? _id + 1 : 0;
          _temporaryFiles.push({
            file: file,
            id: _id,
            path: file.path,
          });
        });

        setTemporaryFiles([]);
        setTemporaryFiles(_temporaryFiles);
        onTemporaryUpload(_temporaryFiles);
      }
    },
    [handleCreateMedia, temporaryFiles, isTemporary, onTemporaryUpload],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  const bg = useColorModeValue("gray.100", "navy.700");
  const borderColor = useColorModeValue("secondaryGray.100", "whiteAlpha.100");

  return (
    <Flex
      align="center"
      justify="center"
      bg={bg}
      border="1px dashed"
      borderColor={borderColor}
      borderRadius="8px"
      w="100%"
      h="max-content"
      minH="100%"
      cursor="pointer"
      {...getRootProps({ className: "dropzone" })}
      {...rest}
    >
      <input {...getInputProps()} />

      <Button variant="no-effects">
        <Box>
          {
            isMedia ? (
              <Center mb="12px">
                {isImgUrl(media_url) ? (
                  // TODO: Might need to make height & widths props
                  <Image
                    src={media_url}
                    alt="image"
                    fit="cover"
                    maxW="100px"
                    maxH="100px"
                  ></Image>
                ) : (
                  <Link href={media_url} target="_blank">
                    <Button colorScheme="blue">Open File</Button>
                  </Link>
                )}
              </Center>
            ) : null
            // <Icon as={MdUpload} w="80px" h="80px" color={brandColor} />
          }

          {description ? (
            <Text fontSize="sm" color="primary.400" className="!font-bold">
              {description}
            </Text>
          ) : (
            <Text fontSize="sm" fontWeight="700" color="secondaryGray.500">
              PNG, JPG and GIF file are allowed
            </Text>
          )}
        </Box>
      </Button>
    </Flex>
  );
}

export default FileInput;
