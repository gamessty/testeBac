"use client";
import React, { useEffect } from 'react';
import { Title, Text, Anchor, List, ListItem } from '@mantine/core';

// Privacy Policy - TBD - NEEDS EDITING
// ADD an afix that says powed by termly.io

export default function PrivacyPolicy() {
  const [baseURL, setBaseURL] = React.useState<string | undefined>(undefined);

  useEffect(() => {
    if(!window || !window.location) return;
    setBaseURL(window.location.host);
  }
  , []);

  const baseURLGenerator = (host?: string) => process.env.BASE_URL ?? (host?.includes('localhost') ? 'http://' + host : 'https://' + host) ?? 'https://teste.gamessty.eu';
  return (
    <div>
      PRIVACY POLICY Last updated February 07, 2025 This Privacy Notice for
      __________ (&apos;we&apos;, &apos;us&apos;, or &apos;our&apos; ),
      describes how and why we might access, collect, store, use, and/or share
      (&apos;process&apos;) your personal information when you use our services
      (&apos;Services&apos;), including when you:{' '}
      <List type="unordered">
        <ListItem>
          Visit our website at{' '}
          <Anchor href={baseURLGenerator(baseURL)} target="_blank">
            {baseURLGenerator(baseURL)}
          </Anchor>
          , or any website of ours that links to this Privacy Notice
        </ListItem>
      </List>{' '}
      <List type="unordered">
        <ListItem>
          Use testeBac . An educational digital platforms that aims at helping
          students by offer solutions to test their knowledge through the use of
          single or multiple choice questions, all in an easy to use platform.
        </ListItem>
      </List>{' '}
      <List type="unordered">
        <ListItem>
          Engage with us in other related ways, including any sales, marketing,
          or events
        </ListItem>
      </List>{' '}
      Questions or concerns? Reading this Privacy Notice will help you
      understand your privacy rights and choices. We are responsible for making
      decisions about how your personal information is processed. If you do not
      agree with our policies and practices, please do not use our Services. If
      you still have any questions or concerns, please contact us at
      support@gamessty.eu. SUMMARY OF KEY POINTS This summary provides key
      points from our Privacy Notice, but you can find out more details about
      any of these topics by clicking the link following each key point or by
      using our <Anchor href="#toc">table of contents</Anchor> below to find the
      section you are looking for.{' '}
      <Text>
        What personal information do we process? When you visit, use, or
        navigate our Services, we may process personal information depending on
        how you interact with us and the Services, the choices you make, and the
        products and features you use. Learn more about
      </Text>{' '}
      <Anchor href="#personalinfo">
        personal information you disclose to us
      </Anchor>{' '}
      <Text>.</Text> Do we process any sensitive personal information? Some of
      the information may be considered &apos;special&apos; or
      &apos;sensitive&apos; in certain jurisdictions, for example your racial or
      ethnic origins, sexual orientation, and religious beliefs. We do not
      process sensitive personal information. Do we collect any information from
      third parties? We do not collect any information from third parties.{' '}
      <Text>
        How do we process your information? We process your information to
        provide, improve, and administer our Services, communicate with you, for
        security and fraud prevention, and to comply with law. We may also
        process your information for other purposes with your consent. We
        process your information only when we have a valid legal reason to do
        so. Learn more about
      </Text>{' '}
      <Anchor href="#infouse">how we process your information</Anchor>{' '}
      <Text>.</Text> In what situations and with which types of parties do we
      share personal information? We may share information in specific
      situations and with specific categories of third parties. Learn more about{' '}
      <Anchor href="#whoshare">
        when and with whom we share your personal information
      </Anchor>{' '}
      .{' '}
      <Text>
        How do we keep your information safe? We have adequate organisational
        and technical processes and procedures in place to protect your personal
        information. However, no electronic transmission over the internet or
        information storage technology can be guaranteed to be 100% secure, so
        we cannot promise or guarantee that hackers, cybercriminals, or other
        unauthorised third parties will not be able to defeat our security and
        improperly collect, access, steal, or modify your information. Learn
        more about
      </Text>{' '}
      <Anchor href="#infosafe">how we keep your information safe</Anchor>{' '}
      <Text>.</Text>{' '}
      <Text>
        What are your rights? Depending on where you are located geographically,
        the applicable privacy law may mean you have certain rights regarding
        your personal information. Learn more about
      </Text>{' '}
      <Anchor href="#privacyrights">your privacy rights</Anchor> <Text>.</Text>{' '}
      How do you exercise your rights? The easiest way to exercise your rights
      is by submitting a{' '}
      <Anchor
        href="https://app.termly.io/notify/e95b1b8a-e91b-43f9-878e-dcc749e58ad6"
        target="_blank"
      >
        data subject access request
      </Anchor>{' '}
      , or by contacting us. We will consider and act upon any request in
      accordance with applicable data protection laws. Want to learn more about
      what we do with any information we collect?{' '}
      <Anchor href="#toc">Review the Privacy Notice in full</Anchor> . TABLE OF
      CONTENTS{' '}
      <Anchor href="#infocollect">1. WHAT INFORMATION DO WE COLLECT?</Anchor>{' '}
      <Anchor href="#infouse">2. HOW DO WE PROCESS YOUR INFORMATION?</Anchor>{' '}
      <Anchor href="#legalbases">
        3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?
      </Anchor>{' '}
      <Anchor href="#whoshare">
        4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
      </Anchor>{' '}
      <Anchor href="#cookies">
        5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
      </Anchor>{' '}
      <Anchor href="#sociallogins">
        6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?
      </Anchor>{' '}
      <Anchor href="#inforetain">
        7. HOW LONG DO WE KEEP YOUR INFORMATION?
      </Anchor>{' '}
      <Anchor href="#infosafe">8. HOW DO WE KEEP YOUR INFORMATION SAFE?</Anchor>{' '}
      <Anchor href="#privacyrights">9. WHAT ARE YOUR PRIVACY RIGHTS?</Anchor>{' '}
      <Anchor href="#DNT">10. CONTROLS FOR DO-NOT-TRACK FEATURES </Anchor>{' '}
      <Anchor href="#DNT"></Anchor> <Anchor href="#DNT"></Anchor>{' '}
      <Anchor href="#policyupdates">
        11. DO WE MAKE UPDATES TO THIS NOTICE?
      </Anchor>{' '}
      <Anchor href="#contact">
        12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
      </Anchor>{' '}
      <Anchor href="#request">
        13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
      </Anchor>{' '}
      <Title order={2}>1. WHAT INFORMATION DO WE COLLECT?</Title>{' '}
      <Title order={3}>Personal information you disclose to us</Title>{' '}
      <Text>In Short:</Text>{' '}
      <Text>We collect personal information that you provide to us.</Text> We
      collect personal information that you voluntarily provide to us when you
      register on the Services, express an interest in obtaining information
      about us or our products and Services, when you participate in activities
      on the Services, or otherwise when you contact us. Personal Information
      Provided by You. The personal information that we collect depends on the
      context of your interactions with us and the Services, the choices you
      make, and the products and features you use. The personal information we
      collect may include the following:{' '}
      <List type="unordered">
        <ListItem>names</ListItem>
      </List>{' '}
      <List type="unordered">
        <ListItem>email addresses</ListItem>
      </List>{' '}
      <List type="unordered">
        <ListItem>usernames</ListItem>
      </List>{' '}
      <List type="unordered">
        <ListItem>contact or authentication data</ListItem>
      </List>{' '}
      <List type="unordered">
        <ListItem>profile picture</ListItem>
      </List>{' '}
      Sensitive Information. We do not process sensitive information. Social
      Media Login Data. We may provide you with the option to register with us
      using your existing social media account details, like your Facebook, X,
      or other social media account. If you choose to register in this way, we
      will collect certain profile information about you from the social media
      provider, as described in the section called &apos;HOW DO WE HANDLE YOUR
      SOCIAL LOGINS?&apos; below. All personal information that you provide to
      us must be true, complete, and accurate, and you must notify us of any
      changes to such personal information. Google API Our use of information
      received from Google APIs will adhere to{' '}
      <Anchor
        href="https://developers.google.com/terms/api-services-user-data-policy"
        target="_blank"
      >
        Google API Services User Data Policy
      </Anchor>{' '}
      , including the{' '}
      <Anchor
        href="https://developers.google.com/terms/api-services-user-data-policy#limited-use"
        target="_blank"
      >
        Limited Use requirements
      </Anchor>{' '}
      . 2. HOW DO WE PROCESS YOUR INFORMATION? In Short: We process your
      information to provide, improve, and administer our Services, communicate
      with you, for security and fraud prevention, and to comply with law. We
      may also process your information for other purposes with your consent. We
      process your personal information for a variety of reasons, depending on
      how you interact with our Services, including:{' '}
      <List type="unordered">
        <ListItem>
          To facilitate account creation and authentication and otherwise manage
          user accounts. We may process your information so you can create and
          log in to your account, as well as keep your account in working order.
        </ListItem>
      </List>{' '}
      <List type="unordered">
        <ListItem>
          To deliver and facilitate delivery of services to the user. We may
          process your information to provide you with the requested service.
        </ListItem>
      </List>{' '}
      <List type="unordered">
        <ListItem>
          To respond to user inquiries/offer support to users. We may process
          your information to respond to your inquiries and solve any potential
          issues you might have with the requested service.
        </ListItem>
      </List>{' '}
      <Text></Text> <Text></Text>{' '}
      <List type="unordered">
        <ListItem>
          To save or protect an individual&apos;s vital interest. We may process
          your information when necessary to save or protect an individual’s
          vital interest, such as to prevent harm.
        </ListItem>
      </List>{' '}
      3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION? In
      Short: We only process your personal information when we believe it is
      necessary and we have a valid legal reason (i.e. legal basis) to do so
      under applicable law, like with your consent, to comply with laws, to
      provide you with services to enter into or fulfil our contractual
      obligations, to protect your rights, or to fulfil our legitimate business
      interests. The General Data Protection Regulation (GDPR) and UK GDPR
      require us to explain the valid legal bases we rely on in order to process
      your personal information. As such, we may rely on the following legal
      bases to process your personal information:{' '}
      <List type="unordered">
        <ListItem>
          Consent. We may process your information if you have given us
          permission (i.e. consent) to use your personal information for a
          specific purpose. You can withdraw your consent at any time. Learn
          more about{' '}
          <Anchor href="#withdrawconsent">withdrawing your consent</Anchor> .
        </ListItem>
      </List>{' '}
      <List type="unordered">
        <ListItem>
          Performance of a Contract. We may process your personal information
          when we believe it is necessary to fulfil our contractual obligations
          to you, including providing our Services or at your request prior to
          entering into a contract with you.
        </ListItem>
      </List>{' '}
      <List type="unordered">
        <ListItem>
          Legal Obligations. We may process your information where we believe it
          is necessary for compliance with our legal obligations, such as to
          cooperate with a law enforcement body or regulatory agency, exercise
          or defend our legal rights, or disclose your information as evidence
          in litigation in which we are involved.
        </ListItem>
      </List>{' '}
      <List type="unordered">
        <ListItem>
          Vital Interests. We may process your information where we believe it
          is necessary to protect your vital interests or the vital interests of
          a third party, such as situations involving potential threats to the
          safety of any person.
        </ListItem>
      </List>{' '}
      4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION? In Short: We
      may share information in specific situations described in this section
      and/or with the following categories of third parties. Vendors,
      Consultants, and Other Third-Party Service Providers. We may share your
      data with third-party vendors, service providers, contractors, or agents
      (&apos;third parties&apos;) who perform services for us or on our behalf
      and require access to such information to do that work. We have contracts
      in place with our third parties, which are designed to help safeguard your
      personal information. This means that they cannot do anything with your
      personal information unless we have instructed them to do it. They will
      also not share your personal information with any organisation apart from
      us. They also commit to pr otect the data they hold on our behalf and to
      retain it for the period we instruct. The categories of third parties we
      may share personal information with are as follows:{' '}
      <List type="unordered">
        <ListItem>User Account Registration & Authentication Services</ListItem>
      </List>{' '}
      We also may need to share your personal information in the following
      situations:{' '}
      <List type="unordered">
        <ListItem>
          Business Transfers. We may share or transfer your information in
          connection with, or during negotiations of, any merger, sale of
          company assets, financing, or acquisition of all or a portion of our
          business to another company.
        </ListItem>
      </List>{' '}
      5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES? In Short: We may use
      cookies and other tracking technologies to collect and store your
      information. We may use cookies and similar tracking technologies (like
      web beacons and pixels) to gather information when you interact with our
      Services. Some online tracking technologies help us maintain the security
      of our Services and your account, prevent crashes, fix bugs, save your
      preferences, and assist with basic site functions. We also permit third
      parties and service providers to use online tracking technologies on our
      Services for analytics and advertising, including to help manage and
      display advertisements, to tailor advertisements to your interests, or to
      send abandoned shopping cart reminders (depending on your communication
      preferences). The third parties and service providers use their technology
      to provide advertising about products and services tailored to your
      interests which may appear either on our Services or on other websites.
      Specific information about how we use such technologies and how you can
      refuse certain cookies is set out in our Cookie Notice: __________. 6. HOW
      DO WE HANDLE YOUR SOCIAL LOGINS? In Short: If you choose to register or
      log in to our Services using a social media account, we may have access to
      certain information about you. Our Services offer you the ability to
      register and log in using your third-party social media account details
      (like your Facebook or X logins). Where you choose to do this, we will
      receive certain profile information about you from your social media
      provider. The profile information we receive may vary depending on the
      social media provider concerned, but will often include your name, email
      address, friends list, and profile picture, as well as other information
      you choose to make public on such a social media platform. We will use the
      information we receive only for the purposes that are described in this
      Privacy Notice or that are otherwise made clear to you on the relevant
      Services. Please note that we do not control, and are not responsible for,
      other uses of your personal information by your third-party social media
      provider. We recommend that you review their privacy notice to understand
      how they collect, use, and share your personal information, and how you
      can set your privacy preferences on their sites and apps. 7. HOW LONG DO
      WE KEEP YOUR INFORMATION? In Short: We keep your information for as long
      as necessary to fulfil the purposes outlined in this Privacy Notice unless
      otherwise required by law. We will only keep your personal information for
      as long as it is necessary for the purposes set out in this Privacy
      Notice, unless a longer retention period is required or permitted by law
      (such as tax, accounting, or other legal requirements). No purpose in this
      notice will require us keeping your personal information for longer than
      the period of time in which users have an account with us. When we have no
      ongoing legitimate business need to process your personal information, we
      will either delete or anonymise such information, or, if this is not
      possible (for example, because your personal information has been stored
      in backup archives), then we will securely store your personal information
      and isolate it from any further processing until deletion is possible. 8.
      HOW DO WE KEEP YOUR INFORMATION SAFE? In Short: We aim to protect your
      personal information through a system of organisational and technical
      security measures. We have implemented appropriate and reasonable
      technical and organisational security measures designed to protect the
      security of any personal information we process. However, despite our
      safeguards and efforts to secure your information, no electronic
      transmission over the Internet or information storage technology can be
      guaranteed to be 100% secure, so we cannot promise or guarantee that
      hackers, cybercriminals, or other unauthorised third parties will not be
      able to defeat our security and improperly collect, access, steal, or
      modify your information. Although we will do our best to protect your
      personal information, transmission of personal information to and from our
      Services is at your own risk. You should only access the Services within a
      secure environment. 9. WHAT ARE YOUR PRIVACY RIGHTS? In Short: In some
      regions, such as the European Economic Area (EEA), United Kingdom (UK),
      and Switzerland, you have rights that allow you greater access to and
      control over your personal information. You may review, change, or
      terminate your account at any time, depending on your country, province,
      or state of residence. In some regions (like the EEA, UK, and
      Switzerland), you have certain rights under applicable data protection
      laws. These may include the right (i) to request access and obtain a copy
      of your personal information, (ii) to request rectification or erasure;
      (iii) to restrict the processing of your personal information; (iv) if
      applicable, to data portability; and (v) not to be subject to automated
      decision-making. In certain circumstances, you may also have the right to
      object to the processing of your personal information. You can make such a
      request by contacting us by using the contact details provided in the
      section &apos;{' '}
      <Anchor href="#contact">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</Anchor>{' '}
      &apos; below. We will consider and act upon any request in accordance with
      applicable data protection laws. If you are located in the EEA or UK and
      you believe we are unlawfully processing your personal information, you
      also have the right to complain to your Member State data protection
      authority or{' '}
      <Anchor
        href="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/"
        target="_blank"
      >
        UK data protection authority
      </Anchor>{' '}
      . If you are located in Switzerland, you may contact the Federal Data
      Protection and Information Commissioner. Withdrawing your consent: If we
      are relying on your consent to process your personal information, you have
      the right to withdraw your consent at any time. You can withdraw your
      consent at any time by contacting us by using the contact details provided
      in the section &apos;{' '}
      <Anchor href="#contact">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</Anchor>{' '}
      &apos; below or updating your preferences.{' '}
      <Text>
        However, please note that this will not affect the lawfulness of the
        processing before its withdrawal nor, will it affect the processing of
        your personal information conducted in reliance on lawful processing
        grounds other than consent.
      </Text>{' '}
      <Title order={3}>Account Information</Title>{' '}
      <Text>
        If you would at any time like to review or change the information in
        your account or terminate your account, you can:
      </Text>{' '}
      <List type="unordered">
        <ListItem>
          Log in to your account settings and update your user account.
        </ListItem>
      </List>{' '}
      Upon your request to terminate your account, we will deactivate or delete
      your account and information from our active databases. However, we may
      retain some information in our files to prevent fraud, troubleshoot
      problems, assist with any investigations, enforce our legal terms and/or
      comply with applicable legal requirements. Cookies and similar
      technologies: Most Web browsers are set to accept cookies by default. If
      you prefer, you can usually choose to set your browser to remove cookies
      and to reject cookies. If you choose to remove cookies or reject cookies,
      this could affect certain features or services of our Services. For
      further information, please see our Cookie Notice: __________.{' '}
      <Text>
        If you have questions or comments about your privacy rights, you may
        email us at support@gamessty.eu.
      </Text>{' '}
      10. CONTROLS FOR DO-NOT-TRACK FEATURES Most web browsers and some mobile
      operating systems and mobile applications include a Do-Not-Track
      (&apos;DNT&apos;) feature or setting you can activate to signal your
      privacy preference not to have data about your online browsing activities
      monitored and collected. At this stage, no uniform technology standard for
      recognising and implementing DNT signals has been finalised. As such, we
      do not currently respond to DNT browser signals or any other mechanism
      that automatically communicates your choice not to be tracked online. If a
      standard for online tracking is adopted that we must follow in the future,
      we will inform you about that practice in a revised version of this
      Privacy Notice. 11. DO WE MAKE UPDATES TO THIS NOTICE? In Short: Yes, we
      will update this notice as necessary to stay compliant with relevant laws.
      We may update this Privacy Notice from time to time. The updated version
      will be indicated by an updated &apos;Revised&apos; date at the top of
      this Privacy Notice. If we make material changes to this Privacy Notice,
      we may notify you either by prominently posting a notice of such changes
      or by directly sending you a notification. We encourage you to review this
      Privacy Notice frequently to be informed of how we are protecting your
      information. 12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE? If you have
      questions or comments about this notice, you may email us at
      support@gamessty.eu .{' '}
      <Title order={2}>
        13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
      </Title>{' '}
      <Text>
        Based on the applicable laws of your country, you may have the right to
        request access to the personal information we collect from you, details
        about how we have processed it, correct inaccuracies, or delete your
        personal information. You may also have the right to withdraw your
        consent to our processing of your personal information. These rights may
        be limited in some circumstances by applicable law. To request to
        review, update, or delete your personal information, please fill out and
        submit a
      </Text>{' '}
      <Text>data subject access request</Text> <Text>.</Text>
    </div>
  );
}
