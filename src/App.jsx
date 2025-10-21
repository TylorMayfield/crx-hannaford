import {
  AppShell,
  Text,
  Button,
  Group,
  Stack,
  Container,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBrandGithub } from "@tabler/icons-react";
import { useEffect } from "react";
import "./App.css";
import "./styles.css";

function App() {
  useEffect(() => {
    const messageListener = (message) => {
      switch (message.type) {
        case "SHOW_PROGRESS":
          notifications.show({
            id: "clipping-progress",
            title: "Clipping...",
            message: message.message,
            color: "blue",
            autoClose: false,
          });
          break;
        case "SHOW_SUCCESS":
          notifications.update({
            id: "clipping-progress",
            title: "Complete",
            message: message.message,
            color: "green",
            autoClose: 5000,
          });
          break;
        case "SHOW_LOGIN_PROMPT":
          notifications.show({
            title: "Login Required",
            message: message.message,
            color: "yellow",
          });
          break;
        case "SHOW_ERROR":
          notifications.show({
            title: "Error",
            message: message.message,
            color: "red",
          });
          break;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleClipCoupons = () => {
    chrome.runtime.sendMessage({ type: "CLIP_COUPONS" }, (response) => {
      if (chrome.runtime.lastError) {
        notifications.show({
          title: "Error",
          message: "Could not connect to the extension's background script.",
          color: "red",
        });
      } else if (response && response.ok) {
        notifications.show({
          id: "clipping-progress",
          title: "Starting...",
          message: "Navigating to coupons page and preparing to clip.",
          color: "blue",
          autoClose: false,
        });
      }
    });
  };

  return (
    <div style={{ width: "400px", minHeight: "500px" }}>
      <AppShell padding="md" header={{ height: 60 }}>
        <AppShell.Header p="xs">
          <Group position="apart">
            <Title order={3}>Hannaford Coupons</Title>
            <a
              href="https://github.com/TylorMayfield/crx-hannaford"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandGithub size={24} />
            </a>
          </Group>
        </AppShell.Header>
        <Container>
          <Stack spacing="lg">
            <Text size="sm" align="center">
              Automatically clip all available coupons on Hannaford.com.
            </Text>
            <Button
              variant="gradient"
              gradient={{ from: "teal", to: "green" }}
              onClick={handleClipCoupons}
              size="lg"
              fullWidth
            >
              Clip All Coupons
            </Button>
            <Text size="xs" color="dimmed" align="center">
              Make sure you are logged in to your Hannaford account first.
            </Text>
            <Text size="xs" color="dimmed" align="center" mt="xl">
              Not affiliated with Hannaford.
            </Text>
          </Stack>
        </Container>
      </AppShell>
    </div>
  );
}

export default App;
