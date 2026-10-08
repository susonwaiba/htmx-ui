// Icons imported as text (`import x from "./icons/x.svg" with { type: "text" }`): the bundler
// inlines the file's markup, so behaviours share src/icons with the icon() macro.
declare module "*.svg" {
  const markup: string;
  export default markup;
}
