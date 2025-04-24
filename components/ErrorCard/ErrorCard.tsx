"use client";

import { Card, Title, Text, Button, Group, Code, Container, Center, CardProps } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

interface ErrorCardProps extends Omit<CardProps, 'children'> {
  title: string;
  description: string;
  errorCode?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  fullHeight?: boolean;
  maxWidth?: number;
}

export default function ErrorCard({
  title,
  description,
  errorCode,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  fullHeight = false,
  maxWidth = 500,
  ...cardProps
}: Readonly<ErrorCardProps>) {
  const content = (
    <Card shadow="md" p="xl" radius="md" withBorder style={{ width: '100%', maxWidth }} {...cardProps}>
      <Center mb="lg">
        <IconAlertTriangle size={48} color="orange" stroke={1.5} />
      </Center>
      
      <Title order={2} ta="center" mb="md">
        {title}
      </Title>
      
      <Text c="dimmed" size="sm" ta="center" mb="xl">
        {description}
      </Text>

      {errorCode && (
        <Text size="xs" c="dimmed" ta="center" mb="md">
          Error code: <Code>{errorCode}</Code>
        </Text>
      )}

      <Group justify="center">
        {primaryButtonText && (
          <Button onClick={onPrimaryButtonClick} color="blue">
            {primaryButtonText}
          </Button>
        )}
        {secondaryButtonText && (
          <Button onClick={onSecondaryButtonClick} variant="outline">
            {secondaryButtonText}
          </Button>
        )}
      </Group>
    </Card>
  );

  if (fullHeight) {
    return (
      <Container size="sm" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </Container>
    );
  }

  return content;
}
