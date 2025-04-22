import React from 'react';
import { Center, Loader } from '@mantine/core';

const Loading = () => {
    return (
            <Center style={{ height: '100%' }}>
                <Loader size="xl" color="teal" type="dots" />
            </Center>
    );
};

export default Loading;