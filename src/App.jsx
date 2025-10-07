import {
  MantineProvider,
  AppShell,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Box,
  Badge,
  Divider,
  Image,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { notifications } from "@mantine/notifications";
import { IconBrandGithub } from "@tabler/icons-react";
import "./App.css";

function App() {
  const dark = true; // Always use dark mode

  const openAndClipCoupons = async () => {
    const couponsUrl = "https://www.hannaford.com/coupons";
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab && tab.url && tab.url.startsWith("https://www.hannaford.com/")) {
        chrome.tabs.update(tab.id, { url: couponsUrl }, () => {
          const targetTabId = tab.id;
          const onUpdated = (updatedTabId, info) => {
            if (updatedTabId === targetTabId && info.status === "complete") {
              chrome.tabs.onUpdated.removeListener(onUpdated);
              chrome.tabs.sendMessage(
                targetTabId,
                { type: "CLIP_HANNAFORD_COUPONS" },
                (resp) => {
                  if (resp && resp.ok) {
                    notifications.show({
                      title: "Coupons",
                      message: `Clipping ${resp.clicked} coupons...`,
                      color: "green",
                    });
                  } else if (resp && resp.reason === "not_logged_in") {
                    notifications.show({
                      title: "Login required",
                      message: "Please log in to Hannaford, then try again.",
                      color: "yellow",
                    });
                  } else {
                    notifications.show({
                      title: "Error",
                      message: "Could not start coupon clipping.",
                      color: "red",
                    });
                  }
                }
              );
            }
          };
          chrome.tabs.onUpdated.addListener(onUpdated);
        });
        return;
      }

      chrome.tabs.create({ url: couponsUrl, active: true }, (createdTab) => {
        const targetTabId = createdTab.id;
        const onUpdated = (updatedTabId, info) => {
          if (updatedTabId === targetTabId && info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(onUpdated);
            chrome.tabs.sendMessage(
              targetTabId,
              { type: "CLIP_HANNAFORD_COUPONS" },
              (resp) => {
                if (resp && resp.ok) {
                  notifications.show({
                    title: "Coupons",
                    message: `Clipping ${resp.clicked} coupons...`,
                    color: "green",
                  });
                } else if (resp && resp.reason === "not_logged_in") {
                  notifications.show({
                    title: "Login required",
                    message: "Please log in to Hannaford, then try again.",
                    color: "yellow",
                  });
                } else {
                  notifications.show({
                    title: "Error",
                    message: "Could not start coupon clipping.",
                    color: "red",
                  });
                }
              }
            );
          }
        };
        chrome.tabs.onUpdated.addListener(onUpdated);
      });
    } catch (e) {
      notifications.show({ title: "Error", message: String(e), color: "red" });
    }
  };

  function Footer() {
    return (
      <footer
        style={{
          marginTop: "auto",
          padding: "10px",
          textAlign: "center",
        }}
      >
        <Group align="center" justify="center" spacing="sm">
          <Text
            size="sm"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <a
              href="https://github.com/TylorMayfield/crx-hannaford"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginRight: "10px" }}
            >
              <IconBrandGithub />
            </a>
          </Text>
        </Group>
      </footer>
    );
  }

  return (
    <MantineProvider
      theme={{
        colorScheme: "dark",
      }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Box
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          minWidth: "400px",
        }}
      >
        <Notifications position="top-center" />
        <AppShell padding="md" style={{ minHeight: "100vh" }}>
          <Stack spacing="lg">
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Box
                style={{
                  background: dark
                    ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0b1324 100%)"
                    : "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #f0f9ff 100%)",
                  borderRadius: 12,
                  padding: "16px",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Box style={{ flex: 1 }}>
                  <Group align="center" justify="space-between">
                    <Text
                      size="lg"
                      weight={700}
                      style={{
                        color: "#ffffff",
                        textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Hannaford Coupons
                    </Text>
                  </Group>
                </Box>
              </Box>

              <Divider my="sm" />

              <Stack spacing="md" mb="sm">
                <Text size="sm" color="dimmed" align="center">
                  Click the button below to automatically scroll through all
                  available coupons and clip them to your account.
                </Text>
                <Text size="xs" color="dimmed" align="center">
                  Make sure you're logged in to your Hannaford account first.
                </Text>
                <Text
                  size="xs"
                  color="dimmed"
                  align="center"
                  style={{ fontStyle: "italic" }}
                >
                  Disclaimer: This extension is not affiliated with or endorsed
                  by Hannaford Bros. Co.
                </Text>
                <Button
                  variant="gradient"
                  gradient={{ from: "teal", to: "green" }}
                  onClick={openAndClipCoupons}
                  size="lg"
                  fullWidth
                >
                  Clip All Coupons
                </Button>
              </Stack>

              <Footer />
            </Card>
          </Stack>
        </AppShell>
      </Box>
    </MantineProvider>
  );
}

export default App;
