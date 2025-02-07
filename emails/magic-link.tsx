import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface MagicLinkEmailProps {
    t: any;
    url: string;
    host: string;
}

const baseURL = (host?: string) => process.env.BASE_URL ?? (host?.includes('localhost') ? 'http://' + host : 'https://' + host) ?? '';

const srcLogo = (host?: string) => baseURL(host) + '/logo.png';

export const MagicLinkEmail = function ({
    t,
    url,
    host,
}: MagicLinkEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>{t('subject')}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Img 
                        alt="testeBac"
                        style={logo}
                        height={42}
                        src={srcLogo(host)}
                    />
                    <Heading style={heading}>{t('subject')}</Heading>
                    <Section style={buttonContainer}>
                        <Button style={button} href={url}>
                            {t('signIn')}
                        </Button>
                    </Section>
                    <Text style={paragraph}>
                        {t('message')}
                    </Text>
                    <Hr style={hr} />
                    <Link href={baseURL(host)} style={reportLink}>
                        testeBac
                    </Link>
                    <Text style={{ ...reportLink, marginTop: '0px' }}>
                        {t('disclaimer', { email: process.env.EMAIL_SUPPORT ?? 'support@gamessty.eu' })}
                    </Text>
                </Container>
            </Body>
        </Html>);
};

export default MagicLinkEmail;

const logo = {
    height: 42,
};

const main = {
    backgroundColor: '#ffffff',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '560px',
};

const heading = {
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '400',
    color: '#484848',
    padding: '17px 0 0',
};

const paragraph = {
    margin: '0 0 15px',
    fontSize: '15px',
    lineHeight: '1.4',
    color: '#3c4149',
};

const buttonContainer = {
    padding: '27px 0 27px',
};

const button = {
    backgroundColor: '#5e6ad2',
    borderRadius: '3px',
    fontWeight: '600',
    color: '#fff',
    fontSize: '15px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '11px 23px',
};

const reportLink = {
    fontSize: '14px',
    color: '#b4becc',
};

const hr = {
    borderColor: '#dfe1e4',
    margin: '42px 0 26px',
};

const code = {
    fontFamily: 'monospace',
    fontWeight: '700',
    padding: '1px 4px',
    backgroundColor: '#dfe1e4',
    letterSpacing: '-0.3px',
    fontSize: '21px',
    borderRadius: '4px',
    color: '#3c4149',
};
