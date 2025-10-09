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
import "./App.css";
import "./styles.css";

function App() {
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

  return (
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
            onClick={openAndClipCoupons}
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
  );
}

export default App;
