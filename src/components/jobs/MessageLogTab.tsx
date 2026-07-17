import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { formatDate } from "@/lib/helpers/helper";
import React, { useEffect, useState } from "react";

export default function MessageLogTab(props: { jobObject: any }) {
  const { jobObject } = props;
  // const _toast = useToast();
  const textColorSecodary = useColorModeValue("#888888", "#888888");
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    // get all chat messages and order by created_at
    let _messages: any[] = [];
    jobObject?.chats?.forEach((chat: any) => {
      chat.chat_messages.forEach((message: any) => {
        let _customer = null;
        let _driver = null;
        // a mess 'cause there are some drivers with full_name and some without
        if (message.user.driver && !message.user.driver?.full_name) {
          _driver = {
            full_name:
              message.user.driver?.first_name +
              " " +
              message.user.driver?.last_name,
          };
        }
        // a mess 'cause there are some customers with full_name and some without
        if (message.user.customer && !message.user.customer?.full_name) {
          _customer = {
            full_name:
              message.user.customer?.first_name +
              " " +
              message.user.customer?.last_name,
          };
        }
        _messages.push({
          ...message,
          message_date: formatDate(message.created_at, "HH:mm, DD/MM/YYYY"),
          user: {
            ...message.user,
            driver: _driver ? _driver : message.user.driver,
            customer: _customer ? _customer : message.user.customer,
          },
        });
      });
    });
    _messages.sort((a: any, b: any) => {
      return new Date(a.created_at) < new Date(b.created_at) ? 1 : -1;
    });
    setChatMessages(_messages);
  }, [jobObject]);
  return (
    <Box mt={10}>
      {/* Message Log */}
      {chatMessages.map((message: any, index: number) => {
        return (
          <Box mb="16px" width={"80%"} key={index}>
            <Flex justify="left" align="center" mb={1}>
              <Text fontWeight="800!" ms="2px">
                {message.user.driver?.full_name}
                {message.user.customer?.full_name}
              </Text>
              <Text
                fontSize="small"
                fontWeight="400"
                mt={1}
                ml={3}
                textColor={textColorSecodary}
              >
                {message.message_date}
              </Text>
            </Flex>
            <Text>{message.message}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
