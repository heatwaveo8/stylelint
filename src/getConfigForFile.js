/* @flow */
import type {
  stylelint$configAugmented,
  stylelint$internalApi,
} from "./flow-declarations"
import { augmentConfigFull } from "./augmentConfig"
import { configurationError } from "./utils"

export default function (
  stylelint: stylelint$internalApi,
  searchPath?: string,
): Promise<{
  config: stylelint$configAugmented,
  filepath: string
}> {
  searchPath = searchPath || process.cwd()

  if (stylelint._options.config) {
    const cached = stylelint._specifiedConfigCache.get(stylelint._options.config)
    if (cached) return cached

    // stylelint._fullExplorer (cosmiconfig) is already configured to
    // run augmentConfigFull; but since we're making up the result here,
    // we need to manually run the transform
    const augmentedResult = augmentConfigFull(stylelint, {
      config: stylelint._options.config,
      filepath: process.cwd(),
    })
    stylelint._specifiedConfigCache.set(stylelint._options.config, augmentedResult)
    return augmentedResult
  }

  return stylelint._fullExplorer.load(searchPath, stylelint._options.configFile)
    .then((config) => {
      if (!config) {
        const ending = (searchPath) ? ` for ${searchPath}` : ""
        throw configurationError(`No configuration provided${ending}`)
      }
      return config
    })
}
