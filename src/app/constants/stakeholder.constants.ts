export const emailRegex: RegExp =
new RegExp ([`^(([^<>()[\\]\\\.,;:\\s@\"]+(\\.[^<>()\\[\\]\\\.,;:\\s@\"]+)*)`,
`|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.`,
`[0-9]{1,3}\])|(([a-zA-Z\\-0-9]+\\.)+`,
`[a-zA-Z]{2,}))$`].join(``));

export const extendedProfileCopy: string = `Visit NextTier on the web to access your extended ` +
  `profile where you can change your password, notification settings, contact information, ` +
  `and more!`;

export const registerMessage = {
  message:  `If you do not have an account, please contact your counselor or school administrator. ` +
    `Feel free to contact us directly at signup@nexttier.com.`,
  subTitle: `The account creation process is automated by your high school. `,
  title: `Thank you for your interest in NextTier!`
};

export const stakeholderRoutes = [
    `login`,
    `register`
];
