import { Center, Text, Title } from '@mantine/core';
import classes from './Logo.module.css';

export default function Logo() {
    return (
        <Center h="100vh" w="100vw">
            <Title className={classes.title} ta="center">
                <Text inherit variant="gradient" gradient={{ from: 'pink', to: 'yellow' }}>
                    testeBac
                </Text>
            </Title>
        </Center>
    );
}