#!/usr/bin/env node
import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/error.js
var require_error = __commonJS((exports) => {
  class CommanderError extends Error {
    constructor(exitCode, code, message) {
      super(message);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.code = code;
      this.exitCode = exitCode;
      this.nestedError = undefined;
    }
  }

  class InvalidArgumentError extends CommanderError {
    constructor(message) {
      super(1, "commander.invalidArgument", message);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
    }
  }
  exports.CommanderError = CommanderError;
  exports.InvalidArgumentError = InvalidArgumentError;
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/argument.js
var require_argument = __commonJS((exports) => {
  var { InvalidArgumentError } = require_error();

  class Argument {
    constructor(name, description) {
      this.description = description || "";
      this.variadic = false;
      this.parseArg = undefined;
      this.defaultValue = undefined;
      this.defaultValueDescription = undefined;
      this.argChoices = undefined;
      switch (name[0]) {
        case "<":
          this.required = true;
          this._name = name.slice(1, -1);
          break;
        case "[":
          this.required = false;
          this._name = name.slice(1, -1);
          break;
        default:
          this.required = true;
          this._name = name;
          break;
      }
      if (this._name.length > 3 && this._name.slice(-3) === "...") {
        this.variadic = true;
        this._name = this._name.slice(0, -3);
      }
    }
    name() {
      return this._name;
    }
    _concatValue(value, previous) {
      if (previous === this.defaultValue || !Array.isArray(previous)) {
        return [value];
      }
      return previous.concat(value);
    }
    default(value, description) {
      this.defaultValue = value;
      this.defaultValueDescription = description;
      return this;
    }
    argParser(fn) {
      this.parseArg = fn;
      return this;
    }
    choices(values) {
      this.argChoices = values.slice();
      this.parseArg = (arg, previous) => {
        if (!this.argChoices.includes(arg)) {
          throw new InvalidArgumentError(`Allowed choices are ${this.argChoices.join(", ")}.`);
        }
        if (this.variadic) {
          return this._concatValue(arg, previous);
        }
        return arg;
      };
      return this;
    }
    argRequired() {
      this.required = true;
      return this;
    }
    argOptional() {
      this.required = false;
      return this;
    }
  }
  function humanReadableArgName(arg) {
    const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
    return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
  }
  exports.Argument = Argument;
  exports.humanReadableArgName = humanReadableArgName;
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/help.js
var require_help = __commonJS((exports) => {
  var { humanReadableArgName } = require_argument();

  class Help {
    constructor() {
      this.helpWidth = undefined;
      this.sortSubcommands = false;
      this.sortOptions = false;
      this.showGlobalOptions = false;
    }
    visibleCommands(cmd) {
      const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
      const helpCommand = cmd._getHelpCommand();
      if (helpCommand && !helpCommand._hidden) {
        visibleCommands.push(helpCommand);
      }
      if (this.sortSubcommands) {
        visibleCommands.sort((a, b) => {
          return a.name().localeCompare(b.name());
        });
      }
      return visibleCommands;
    }
    compareOptions(a, b) {
      const getSortKey = (option) => {
        return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
      };
      return getSortKey(a).localeCompare(getSortKey(b));
    }
    visibleOptions(cmd) {
      const visibleOptions = cmd.options.filter((option) => !option.hidden);
      const helpOption = cmd._getHelpOption();
      if (helpOption && !helpOption.hidden) {
        const removeShort = helpOption.short && cmd._findOption(helpOption.short);
        const removeLong = helpOption.long && cmd._findOption(helpOption.long);
        if (!removeShort && !removeLong) {
          visibleOptions.push(helpOption);
        } else if (helpOption.long && !removeLong) {
          visibleOptions.push(cmd.createOption(helpOption.long, helpOption.description));
        } else if (helpOption.short && !removeShort) {
          visibleOptions.push(cmd.createOption(helpOption.short, helpOption.description));
        }
      }
      if (this.sortOptions) {
        visibleOptions.sort(this.compareOptions);
      }
      return visibleOptions;
    }
    visibleGlobalOptions(cmd) {
      if (!this.showGlobalOptions)
        return [];
      const globalOptions = [];
      for (let ancestorCmd = cmd.parent;ancestorCmd; ancestorCmd = ancestorCmd.parent) {
        const visibleOptions = ancestorCmd.options.filter((option) => !option.hidden);
        globalOptions.push(...visibleOptions);
      }
      if (this.sortOptions) {
        globalOptions.sort(this.compareOptions);
      }
      return globalOptions;
    }
    visibleArguments(cmd) {
      if (cmd._argsDescription) {
        cmd.registeredArguments.forEach((argument) => {
          argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
        });
      }
      if (cmd.registeredArguments.find((argument) => argument.description)) {
        return cmd.registeredArguments;
      }
      return [];
    }
    subcommandTerm(cmd) {
      const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
      return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + (args ? " " + args : "");
    }
    optionTerm(option) {
      return option.flags;
    }
    argumentTerm(argument) {
      return argument.name();
    }
    longestSubcommandTermLength(cmd, helper) {
      return helper.visibleCommands(cmd).reduce((max, command) => {
        return Math.max(max, helper.subcommandTerm(command).length);
      }, 0);
    }
    longestOptionTermLength(cmd, helper) {
      return helper.visibleOptions(cmd).reduce((max, option) => {
        return Math.max(max, helper.optionTerm(option).length);
      }, 0);
    }
    longestGlobalOptionTermLength(cmd, helper) {
      return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
        return Math.max(max, helper.optionTerm(option).length);
      }, 0);
    }
    longestArgumentTermLength(cmd, helper) {
      return helper.visibleArguments(cmd).reduce((max, argument) => {
        return Math.max(max, helper.argumentTerm(argument).length);
      }, 0);
    }
    commandUsage(cmd) {
      let cmdName = cmd._name;
      if (cmd._aliases[0]) {
        cmdName = cmdName + "|" + cmd._aliases[0];
      }
      let ancestorCmdNames = "";
      for (let ancestorCmd = cmd.parent;ancestorCmd; ancestorCmd = ancestorCmd.parent) {
        ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
      }
      return ancestorCmdNames + cmdName + " " + cmd.usage();
    }
    commandDescription(cmd) {
      return cmd.description();
    }
    subcommandDescription(cmd) {
      return cmd.summary() || cmd.description();
    }
    optionDescription(option) {
      const extraInfo = [];
      if (option.argChoices) {
        extraInfo.push(`choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`);
      }
      if (option.defaultValue !== undefined) {
        const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
        if (showDefault) {
          extraInfo.push(`default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`);
        }
      }
      if (option.presetArg !== undefined && option.optional) {
        extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
      }
      if (option.envVar !== undefined) {
        extraInfo.push(`env: ${option.envVar}`);
      }
      if (extraInfo.length > 0) {
        return `${option.description} (${extraInfo.join(", ")})`;
      }
      return option.description;
    }
    argumentDescription(argument) {
      const extraInfo = [];
      if (argument.argChoices) {
        extraInfo.push(`choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`);
      }
      if (argument.defaultValue !== undefined) {
        extraInfo.push(`default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`);
      }
      if (extraInfo.length > 0) {
        const extraDescripton = `(${extraInfo.join(", ")})`;
        if (argument.description) {
          return `${argument.description} ${extraDescripton}`;
        }
        return extraDescripton;
      }
      return argument.description;
    }
    formatHelp(cmd, helper) {
      const termWidth = helper.padWidth(cmd, helper);
      const helpWidth = helper.helpWidth || 80;
      const itemIndentWidth = 2;
      const itemSeparatorWidth = 2;
      function formatItem(term, description) {
        if (description) {
          const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
          return helper.wrap(fullText, helpWidth - itemIndentWidth, termWidth + itemSeparatorWidth);
        }
        return term;
      }
      function formatList(textArray) {
        return textArray.join(`
`).replace(/^/gm, " ".repeat(itemIndentWidth));
      }
      let output = [`Usage: ${helper.commandUsage(cmd)}`, ""];
      const commandDescription = helper.commandDescription(cmd);
      if (commandDescription.length > 0) {
        output = output.concat([
          helper.wrap(commandDescription, helpWidth, 0),
          ""
        ]);
      }
      const argumentList = helper.visibleArguments(cmd).map((argument) => {
        return formatItem(helper.argumentTerm(argument), helper.argumentDescription(argument));
      });
      if (argumentList.length > 0) {
        output = output.concat(["Arguments:", formatList(argumentList), ""]);
      }
      const optionList = helper.visibleOptions(cmd).map((option) => {
        return formatItem(helper.optionTerm(option), helper.optionDescription(option));
      });
      if (optionList.length > 0) {
        output = output.concat(["Options:", formatList(optionList), ""]);
      }
      if (this.showGlobalOptions) {
        const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
          return formatItem(helper.optionTerm(option), helper.optionDescription(option));
        });
        if (globalOptionList.length > 0) {
          output = output.concat([
            "Global Options:",
            formatList(globalOptionList),
            ""
          ]);
        }
      }
      const commandList = helper.visibleCommands(cmd).map((cmd2) => {
        return formatItem(helper.subcommandTerm(cmd2), helper.subcommandDescription(cmd2));
      });
      if (commandList.length > 0) {
        output = output.concat(["Commands:", formatList(commandList), ""]);
      }
      return output.join(`
`);
    }
    padWidth(cmd, helper) {
      return Math.max(helper.longestOptionTermLength(cmd, helper), helper.longestGlobalOptionTermLength(cmd, helper), helper.longestSubcommandTermLength(cmd, helper), helper.longestArgumentTermLength(cmd, helper));
    }
    wrap(str, width, indent, minColumnWidth = 40) {
      const indents = " \\f\\t\\v   -   　\uFEFF";
      const manualIndent = new RegExp(`[\\n][${indents}]+`);
      if (str.match(manualIndent))
        return str;
      const columnWidth = width - indent;
      if (columnWidth < minColumnWidth)
        return str;
      const leadingStr = str.slice(0, indent);
      const columnText = str.slice(indent).replace(`\r
`, `
`);
      const indentString = " ".repeat(indent);
      const zeroWidthSpace = "​";
      const breaks = `\\s${zeroWidthSpace}`;
      const regex = new RegExp(`
|.{1,${columnWidth - 1}}([${breaks}]|$)|[^${breaks}]+?([${breaks}]|$)`, "g");
      const lines = columnText.match(regex) || [];
      return leadingStr + lines.map((line, i) => {
        if (line === `
`)
          return "";
        return (i > 0 ? indentString : "") + line.trimEnd();
      }).join(`
`);
    }
  }
  exports.Help = Help;
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/option.js
var require_option = __commonJS((exports) => {
  var { InvalidArgumentError } = require_error();

  class Option {
    constructor(flags, description) {
      this.flags = flags;
      this.description = description || "";
      this.required = flags.includes("<");
      this.optional = flags.includes("[");
      this.variadic = /\w\.\.\.[>\]]$/.test(flags);
      this.mandatory = false;
      const optionFlags = splitOptionFlags(flags);
      this.short = optionFlags.shortFlag;
      this.long = optionFlags.longFlag;
      this.negate = false;
      if (this.long) {
        this.negate = this.long.startsWith("--no-");
      }
      this.defaultValue = undefined;
      this.defaultValueDescription = undefined;
      this.presetArg = undefined;
      this.envVar = undefined;
      this.parseArg = undefined;
      this.hidden = false;
      this.argChoices = undefined;
      this.conflictsWith = [];
      this.implied = undefined;
    }
    default(value, description) {
      this.defaultValue = value;
      this.defaultValueDescription = description;
      return this;
    }
    preset(arg) {
      this.presetArg = arg;
      return this;
    }
    conflicts(names) {
      this.conflictsWith = this.conflictsWith.concat(names);
      return this;
    }
    implies(impliedOptionValues) {
      let newImplied = impliedOptionValues;
      if (typeof impliedOptionValues === "string") {
        newImplied = { [impliedOptionValues]: true };
      }
      this.implied = Object.assign(this.implied || {}, newImplied);
      return this;
    }
    env(name) {
      this.envVar = name;
      return this;
    }
    argParser(fn) {
      this.parseArg = fn;
      return this;
    }
    makeOptionMandatory(mandatory = true) {
      this.mandatory = !!mandatory;
      return this;
    }
    hideHelp(hide = true) {
      this.hidden = !!hide;
      return this;
    }
    _concatValue(value, previous) {
      if (previous === this.defaultValue || !Array.isArray(previous)) {
        return [value];
      }
      return previous.concat(value);
    }
    choices(values) {
      this.argChoices = values.slice();
      this.parseArg = (arg, previous) => {
        if (!this.argChoices.includes(arg)) {
          throw new InvalidArgumentError(`Allowed choices are ${this.argChoices.join(", ")}.`);
        }
        if (this.variadic) {
          return this._concatValue(arg, previous);
        }
        return arg;
      };
      return this;
    }
    name() {
      if (this.long) {
        return this.long.replace(/^--/, "");
      }
      return this.short.replace(/^-/, "");
    }
    attributeName() {
      return camelcase(this.name().replace(/^no-/, ""));
    }
    is(arg) {
      return this.short === arg || this.long === arg;
    }
    isBoolean() {
      return !this.required && !this.optional && !this.negate;
    }
  }

  class DualOptions {
    constructor(options) {
      this.positiveOptions = new Map;
      this.negativeOptions = new Map;
      this.dualOptions = new Set;
      options.forEach((option) => {
        if (option.negate) {
          this.negativeOptions.set(option.attributeName(), option);
        } else {
          this.positiveOptions.set(option.attributeName(), option);
        }
      });
      this.negativeOptions.forEach((value, key) => {
        if (this.positiveOptions.has(key)) {
          this.dualOptions.add(key);
        }
      });
    }
    valueFromOption(value, option) {
      const optionKey = option.attributeName();
      if (!this.dualOptions.has(optionKey))
        return true;
      const preset = this.negativeOptions.get(optionKey).presetArg;
      const negativeValue = preset !== undefined ? preset : false;
      return option.negate === (negativeValue === value);
    }
  }
  function camelcase(str) {
    return str.split("-").reduce((str2, word) => {
      return str2 + word[0].toUpperCase() + word.slice(1);
    });
  }
  function splitOptionFlags(flags) {
    let shortFlag;
    let longFlag;
    const flagParts = flags.split(/[ |,]+/);
    if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
      shortFlag = flagParts.shift();
    longFlag = flagParts.shift();
    if (!shortFlag && /^-[^-]$/.test(longFlag)) {
      shortFlag = longFlag;
      longFlag = undefined;
    }
    return { shortFlag, longFlag };
  }
  exports.Option = Option;
  exports.DualOptions = DualOptions;
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS((exports) => {
  var maxDistance = 3;
  function editDistance(a, b) {
    if (Math.abs(a.length - b.length) > maxDistance)
      return Math.max(a.length, b.length);
    const d = [];
    for (let i = 0;i <= a.length; i++) {
      d[i] = [i];
    }
    for (let j = 0;j <= b.length; j++) {
      d[0][j] = j;
    }
    for (let j = 1;j <= b.length; j++) {
      for (let i = 1;i <= a.length; i++) {
        let cost = 1;
        if (a[i - 1] === b[j - 1]) {
          cost = 0;
        } else {
          cost = 1;
        }
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[a.length][b.length];
  }
  function suggestSimilar(word, candidates) {
    if (!candidates || candidates.length === 0)
      return "";
    candidates = Array.from(new Set(candidates));
    const searchingOptions = word.startsWith("--");
    if (searchingOptions) {
      word = word.slice(2);
      candidates = candidates.map((candidate) => candidate.slice(2));
    }
    let similar = [];
    let bestDistance = maxDistance;
    const minSimilarity = 0.4;
    candidates.forEach((candidate) => {
      if (candidate.length <= 1)
        return;
      const distance = editDistance(word, candidate);
      const length = Math.max(word.length, candidate.length);
      const similarity = (length - distance) / length;
      if (similarity > minSimilarity) {
        if (distance < bestDistance) {
          bestDistance = distance;
          similar = [candidate];
        } else if (distance === bestDistance) {
          similar.push(candidate);
        }
      }
    });
    similar.sort((a, b) => a.localeCompare(b));
    if (searchingOptions) {
      similar = similar.map((candidate) => `--${candidate}`);
    }
    if (similar.length > 1) {
      return `
(Did you mean one of ${similar.join(", ")}?)`;
    }
    if (similar.length === 1) {
      return `
(Did you mean ${similar[0]}?)`;
    }
    return "";
  }
  exports.suggestSimilar = suggestSimilar;
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/command.js
var require_command = __commonJS((exports) => {
  var EventEmitter = __require("node:events").EventEmitter;
  var childProcess = __require("node:child_process");
  var path = __require("node:path");
  var fs = __require("node:fs");
  var process2 = __require("node:process");
  var { Argument, humanReadableArgName } = require_argument();
  var { CommanderError } = require_error();
  var { Help } = require_help();
  var { Option, DualOptions } = require_option();
  var { suggestSimilar } = require_suggestSimilar();

  class Command extends EventEmitter {
    constructor(name) {
      super();
      this.commands = [];
      this.options = [];
      this.parent = null;
      this._allowUnknownOption = false;
      this._allowExcessArguments = true;
      this.registeredArguments = [];
      this._args = this.registeredArguments;
      this.args = [];
      this.rawArgs = [];
      this.processedArgs = [];
      this._scriptPath = null;
      this._name = name || "";
      this._optionValues = {};
      this._optionValueSources = {};
      this._storeOptionsAsProperties = false;
      this._actionHandler = null;
      this._executableHandler = false;
      this._executableFile = null;
      this._executableDir = null;
      this._defaultCommandName = null;
      this._exitCallback = null;
      this._aliases = [];
      this._combineFlagAndOptionalValue = true;
      this._description = "";
      this._summary = "";
      this._argsDescription = undefined;
      this._enablePositionalOptions = false;
      this._passThroughOptions = false;
      this._lifeCycleHooks = {};
      this._showHelpAfterError = false;
      this._showSuggestionAfterError = true;
      this._outputConfiguration = {
        writeOut: (str) => process2.stdout.write(str),
        writeErr: (str) => process2.stderr.write(str),
        getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : undefined,
        getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : undefined,
        outputError: (str, write) => write(str)
      };
      this._hidden = false;
      this._helpOption = undefined;
      this._addImplicitHelpCommand = undefined;
      this._helpCommand = undefined;
      this._helpConfiguration = {};
    }
    copyInheritedSettings(sourceCommand) {
      this._outputConfiguration = sourceCommand._outputConfiguration;
      this._helpOption = sourceCommand._helpOption;
      this._helpCommand = sourceCommand._helpCommand;
      this._helpConfiguration = sourceCommand._helpConfiguration;
      this._exitCallback = sourceCommand._exitCallback;
      this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
      this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
      this._allowExcessArguments = sourceCommand._allowExcessArguments;
      this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
      this._showHelpAfterError = sourceCommand._showHelpAfterError;
      this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
      return this;
    }
    _getCommandAndAncestors() {
      const result = [];
      for (let command = this;command; command = command.parent) {
        result.push(command);
      }
      return result;
    }
    command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
      let desc = actionOptsOrExecDesc;
      let opts = execOpts;
      if (typeof desc === "object" && desc !== null) {
        opts = desc;
        desc = null;
      }
      opts = opts || {};
      const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
      const cmd = this.createCommand(name);
      if (desc) {
        cmd.description(desc);
        cmd._executableHandler = true;
      }
      if (opts.isDefault)
        this._defaultCommandName = cmd._name;
      cmd._hidden = !!(opts.noHelp || opts.hidden);
      cmd._executableFile = opts.executableFile || null;
      if (args)
        cmd.arguments(args);
      this._registerCommand(cmd);
      cmd.parent = this;
      cmd.copyInheritedSettings(this);
      if (desc)
        return this;
      return cmd;
    }
    createCommand(name) {
      return new Command(name);
    }
    createHelp() {
      return Object.assign(new Help, this.configureHelp());
    }
    configureHelp(configuration) {
      if (configuration === undefined)
        return this._helpConfiguration;
      this._helpConfiguration = configuration;
      return this;
    }
    configureOutput(configuration) {
      if (configuration === undefined)
        return this._outputConfiguration;
      Object.assign(this._outputConfiguration, configuration);
      return this;
    }
    showHelpAfterError(displayHelp = true) {
      if (typeof displayHelp !== "string")
        displayHelp = !!displayHelp;
      this._showHelpAfterError = displayHelp;
      return this;
    }
    showSuggestionAfterError(displaySuggestion = true) {
      this._showSuggestionAfterError = !!displaySuggestion;
      return this;
    }
    addCommand(cmd, opts) {
      if (!cmd._name) {
        throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
      }
      opts = opts || {};
      if (opts.isDefault)
        this._defaultCommandName = cmd._name;
      if (opts.noHelp || opts.hidden)
        cmd._hidden = true;
      this._registerCommand(cmd);
      cmd.parent = this;
      cmd._checkForBrokenPassThrough();
      return this;
    }
    createArgument(name, description) {
      return new Argument(name, description);
    }
    argument(name, description, fn, defaultValue) {
      const argument = this.createArgument(name, description);
      if (typeof fn === "function") {
        argument.default(defaultValue).argParser(fn);
      } else {
        argument.default(fn);
      }
      this.addArgument(argument);
      return this;
    }
    arguments(names) {
      names.trim().split(/ +/).forEach((detail) => {
        this.argument(detail);
      });
      return this;
    }
    addArgument(argument) {
      const previousArgument = this.registeredArguments.slice(-1)[0];
      if (previousArgument && previousArgument.variadic) {
        throw new Error(`only the last argument can be variadic '${previousArgument.name()}'`);
      }
      if (argument.required && argument.defaultValue !== undefined && argument.parseArg === undefined) {
        throw new Error(`a default value for a required argument is never used: '${argument.name()}'`);
      }
      this.registeredArguments.push(argument);
      return this;
    }
    helpCommand(enableOrNameAndArgs, description) {
      if (typeof enableOrNameAndArgs === "boolean") {
        this._addImplicitHelpCommand = enableOrNameAndArgs;
        return this;
      }
      enableOrNameAndArgs = enableOrNameAndArgs ?? "help [command]";
      const [, helpName, helpArgs] = enableOrNameAndArgs.match(/([^ ]+) *(.*)/);
      const helpDescription = description ?? "display help for command";
      const helpCommand = this.createCommand(helpName);
      helpCommand.helpOption(false);
      if (helpArgs)
        helpCommand.arguments(helpArgs);
      if (helpDescription)
        helpCommand.description(helpDescription);
      this._addImplicitHelpCommand = true;
      this._helpCommand = helpCommand;
      return this;
    }
    addHelpCommand(helpCommand, deprecatedDescription) {
      if (typeof helpCommand !== "object") {
        this.helpCommand(helpCommand, deprecatedDescription);
        return this;
      }
      this._addImplicitHelpCommand = true;
      this._helpCommand = helpCommand;
      return this;
    }
    _getHelpCommand() {
      const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
      if (hasImplicitHelpCommand) {
        if (this._helpCommand === undefined) {
          this.helpCommand(undefined, undefined);
        }
        return this._helpCommand;
      }
      return null;
    }
    hook(event, listener) {
      const allowedValues = ["preSubcommand", "preAction", "postAction"];
      if (!allowedValues.includes(event)) {
        throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
      }
      if (this._lifeCycleHooks[event]) {
        this._lifeCycleHooks[event].push(listener);
      } else {
        this._lifeCycleHooks[event] = [listener];
      }
      return this;
    }
    exitOverride(fn) {
      if (fn) {
        this._exitCallback = fn;
      } else {
        this._exitCallback = (err) => {
          if (err.code !== "commander.executeSubCommandAsync") {
            throw err;
          } else {}
        };
      }
      return this;
    }
    _exit(exitCode, code, message) {
      if (this._exitCallback) {
        this._exitCallback(new CommanderError(exitCode, code, message));
      }
      process2.exit(exitCode);
    }
    action(fn) {
      const listener = (args) => {
        const expectedArgsCount = this.registeredArguments.length;
        const actionArgs = args.slice(0, expectedArgsCount);
        if (this._storeOptionsAsProperties) {
          actionArgs[expectedArgsCount] = this;
        } else {
          actionArgs[expectedArgsCount] = this.opts();
        }
        actionArgs.push(this);
        return fn.apply(this, actionArgs);
      };
      this._actionHandler = listener;
      return this;
    }
    createOption(flags, description) {
      return new Option(flags, description);
    }
    _callParseArg(target, value, previous, invalidArgumentMessage) {
      try {
        return target.parseArg(value, previous);
      } catch (err) {
        if (err.code === "commander.invalidArgument") {
          const message = `${invalidArgumentMessage} ${err.message}`;
          this.error(message, { exitCode: err.exitCode, code: err.code });
        }
        throw err;
      }
    }
    _registerOption(option) {
      const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
      if (matchingOption) {
        const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
        throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
      }
      this.options.push(option);
    }
    _registerCommand(command) {
      const knownBy = (cmd) => {
        return [cmd.name()].concat(cmd.aliases());
      };
      const alreadyUsed = knownBy(command).find((name) => this._findCommand(name));
      if (alreadyUsed) {
        const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
        const newCmd = knownBy(command).join("|");
        throw new Error(`cannot add command '${newCmd}' as already have command '${existingCmd}'`);
      }
      this.commands.push(command);
    }
    addOption(option) {
      this._registerOption(option);
      const oname = option.name();
      const name = option.attributeName();
      if (option.negate) {
        const positiveLongFlag = option.long.replace(/^--no-/, "--");
        if (!this._findOption(positiveLongFlag)) {
          this.setOptionValueWithSource(name, option.defaultValue === undefined ? true : option.defaultValue, "default");
        }
      } else if (option.defaultValue !== undefined) {
        this.setOptionValueWithSource(name, option.defaultValue, "default");
      }
      const handleOptionValue = (val, invalidValueMessage, valueSource) => {
        if (val == null && option.presetArg !== undefined) {
          val = option.presetArg;
        }
        const oldValue = this.getOptionValue(name);
        if (val !== null && option.parseArg) {
          val = this._callParseArg(option, val, oldValue, invalidValueMessage);
        } else if (val !== null && option.variadic) {
          val = option._concatValue(val, oldValue);
        }
        if (val == null) {
          if (option.negate) {
            val = false;
          } else if (option.isBoolean() || option.optional) {
            val = true;
          } else {
            val = "";
          }
        }
        this.setOptionValueWithSource(name, val, valueSource);
      };
      this.on("option:" + oname, (val) => {
        const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
        handleOptionValue(val, invalidValueMessage, "cli");
      });
      if (option.envVar) {
        this.on("optionEnv:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "env");
        });
      }
      return this;
    }
    _optionEx(config, flags, description, fn, defaultValue) {
      if (typeof flags === "object" && flags instanceof Option) {
        throw new Error("To add an Option object use addOption() instead of option() or requiredOption()");
      }
      const option = this.createOption(flags, description);
      option.makeOptionMandatory(!!config.mandatory);
      if (typeof fn === "function") {
        option.default(defaultValue).argParser(fn);
      } else if (fn instanceof RegExp) {
        const regex = fn;
        fn = (val, def) => {
          const m = regex.exec(val);
          return m ? m[0] : def;
        };
        option.default(defaultValue).argParser(fn);
      } else {
        option.default(fn);
      }
      return this.addOption(option);
    }
    option(flags, description, parseArg, defaultValue) {
      return this._optionEx({}, flags, description, parseArg, defaultValue);
    }
    requiredOption(flags, description, parseArg, defaultValue) {
      return this._optionEx({ mandatory: true }, flags, description, parseArg, defaultValue);
    }
    combineFlagAndOptionalValue(combine = true) {
      this._combineFlagAndOptionalValue = !!combine;
      return this;
    }
    allowUnknownOption(allowUnknown = true) {
      this._allowUnknownOption = !!allowUnknown;
      return this;
    }
    allowExcessArguments(allowExcess = true) {
      this._allowExcessArguments = !!allowExcess;
      return this;
    }
    enablePositionalOptions(positional = true) {
      this._enablePositionalOptions = !!positional;
      return this;
    }
    passThroughOptions(passThrough = true) {
      this._passThroughOptions = !!passThrough;
      this._checkForBrokenPassThrough();
      return this;
    }
    _checkForBrokenPassThrough() {
      if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
        throw new Error(`passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`);
      }
    }
    storeOptionsAsProperties(storeAsProperties = true) {
      if (this.options.length) {
        throw new Error("call .storeOptionsAsProperties() before adding options");
      }
      if (Object.keys(this._optionValues).length) {
        throw new Error("call .storeOptionsAsProperties() before setting option values");
      }
      this._storeOptionsAsProperties = !!storeAsProperties;
      return this;
    }
    getOptionValue(key) {
      if (this._storeOptionsAsProperties) {
        return this[key];
      }
      return this._optionValues[key];
    }
    setOptionValue(key, value) {
      return this.setOptionValueWithSource(key, value, undefined);
    }
    setOptionValueWithSource(key, value, source) {
      if (this._storeOptionsAsProperties) {
        this[key] = value;
      } else {
        this._optionValues[key] = value;
      }
      this._optionValueSources[key] = source;
      return this;
    }
    getOptionValueSource(key) {
      return this._optionValueSources[key];
    }
    getOptionValueSourceWithGlobals(key) {
      let source;
      this._getCommandAndAncestors().forEach((cmd) => {
        if (cmd.getOptionValueSource(key) !== undefined) {
          source = cmd.getOptionValueSource(key);
        }
      });
      return source;
    }
    _prepareUserArgs(argv, parseOptions) {
      if (argv !== undefined && !Array.isArray(argv)) {
        throw new Error("first parameter to parse must be array or undefined");
      }
      parseOptions = parseOptions || {};
      if (argv === undefined && parseOptions.from === undefined) {
        if (process2.versions?.electron) {
          parseOptions.from = "electron";
        }
        const execArgv = process2.execArgv ?? [];
        if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
          parseOptions.from = "eval";
        }
      }
      if (argv === undefined) {
        argv = process2.argv;
      }
      this.rawArgs = argv.slice();
      let userArgs;
      switch (parseOptions.from) {
        case undefined:
        case "node":
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
          break;
        case "electron":
          if (process2.defaultApp) {
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
          } else {
            userArgs = argv.slice(1);
          }
          break;
        case "user":
          userArgs = argv.slice(0);
          break;
        case "eval":
          userArgs = argv.slice(1);
          break;
        default:
          throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
      }
      if (!this._name && this._scriptPath)
        this.nameFromFilename(this._scriptPath);
      this._name = this._name || "program";
      return userArgs;
    }
    parse(argv, parseOptions) {
      const userArgs = this._prepareUserArgs(argv, parseOptions);
      this._parseCommand([], userArgs);
      return this;
    }
    async parseAsync(argv, parseOptions) {
      const userArgs = this._prepareUserArgs(argv, parseOptions);
      await this._parseCommand([], userArgs);
      return this;
    }
    _executeSubCommand(subcommand, args) {
      args = args.slice();
      let launchWithNode = false;
      const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
      function findFile(baseDir, baseName) {
        const localBin = path.resolve(baseDir, baseName);
        if (fs.existsSync(localBin))
          return localBin;
        if (sourceExt.includes(path.extname(baseName)))
          return;
        const foundExt = sourceExt.find((ext) => fs.existsSync(`${localBin}${ext}`));
        if (foundExt)
          return `${localBin}${foundExt}`;
        return;
      }
      this._checkForMissingMandatoryOptions();
      this._checkForConflictingOptions();
      let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
      let executableDir = this._executableDir || "";
      if (this._scriptPath) {
        let resolvedScriptPath;
        try {
          resolvedScriptPath = fs.realpathSync(this._scriptPath);
        } catch (err) {
          resolvedScriptPath = this._scriptPath;
        }
        executableDir = path.resolve(path.dirname(resolvedScriptPath), executableDir);
      }
      if (executableDir) {
        let localFile = findFile(executableDir, executableFile);
        if (!localFile && !subcommand._executableFile && this._scriptPath) {
          const legacyName = path.basename(this._scriptPath, path.extname(this._scriptPath));
          if (legacyName !== this._name) {
            localFile = findFile(executableDir, `${legacyName}-${subcommand._name}`);
          }
        }
        executableFile = localFile || executableFile;
      }
      launchWithNode = sourceExt.includes(path.extname(executableFile));
      let proc;
      if (process2.platform !== "win32") {
        if (launchWithNode) {
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
        } else {
          proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
        }
      } else {
        args.unshift(executableFile);
        args = incrementNodeInspectorPort(process2.execArgv).concat(args);
        proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
      }
      if (!proc.killed) {
        const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
        signals.forEach((signal) => {
          process2.on(signal, () => {
            if (proc.killed === false && proc.exitCode === null) {
              proc.kill(signal);
            }
          });
        });
      }
      const exitCallback = this._exitCallback;
      proc.on("close", (code) => {
        code = code ?? 1;
        if (!exitCallback) {
          process2.exit(code);
        } else {
          exitCallback(new CommanderError(code, "commander.executeSubCommandAsync", "(close)"));
        }
      });
      proc.on("error", (err) => {
        if (err.code === "ENOENT") {
          const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
          const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
          throw new Error(executableMissing);
        } else if (err.code === "EACCES") {
          throw new Error(`'${executableFile}' not executable`);
        }
        if (!exitCallback) {
          process2.exit(1);
        } else {
          const wrappedError = new CommanderError(1, "commander.executeSubCommandAsync", "(error)");
          wrappedError.nestedError = err;
          exitCallback(wrappedError);
        }
      });
      this.runningCommand = proc;
    }
    _dispatchSubcommand(commandName, operands, unknown) {
      const subCommand = this._findCommand(commandName);
      if (!subCommand)
        this.help({ error: true });
      let promiseChain;
      promiseChain = this._chainOrCallSubCommandHook(promiseChain, subCommand, "preSubcommand");
      promiseChain = this._chainOrCall(promiseChain, () => {
        if (subCommand._executableHandler) {
          this._executeSubCommand(subCommand, operands.concat(unknown));
        } else {
          return subCommand._parseCommand(operands, unknown);
        }
      });
      return promiseChain;
    }
    _dispatchHelpCommand(subcommandName) {
      if (!subcommandName) {
        this.help();
      }
      const subCommand = this._findCommand(subcommandName);
      if (subCommand && !subCommand._executableHandler) {
        subCommand.help();
      }
      return this._dispatchSubcommand(subcommandName, [], [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]);
    }
    _checkNumberOfArguments() {
      this.registeredArguments.forEach((arg, i) => {
        if (arg.required && this.args[i] == null) {
          this.missingArgument(arg.name());
        }
      });
      if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
        return;
      }
      if (this.args.length > this.registeredArguments.length) {
        this._excessArguments(this.args);
      }
    }
    _processArguments() {
      const myParseArg = (argument, value, previous) => {
        let parsedValue = value;
        if (value !== null && argument.parseArg) {
          const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
          parsedValue = this._callParseArg(argument, value, previous, invalidValueMessage);
        }
        return parsedValue;
      };
      this._checkNumberOfArguments();
      const processedArgs = [];
      this.registeredArguments.forEach((declaredArg, index) => {
        let value = declaredArg.defaultValue;
        if (declaredArg.variadic) {
          if (index < this.args.length) {
            value = this.args.slice(index);
            if (declaredArg.parseArg) {
              value = value.reduce((processed, v) => {
                return myParseArg(declaredArg, v, processed);
              }, declaredArg.defaultValue);
            }
          } else if (value === undefined) {
            value = [];
          }
        } else if (index < this.args.length) {
          value = this.args[index];
          if (declaredArg.parseArg) {
            value = myParseArg(declaredArg, value, declaredArg.defaultValue);
          }
        }
        processedArgs[index] = value;
      });
      this.processedArgs = processedArgs;
    }
    _chainOrCall(promise, fn) {
      if (promise && promise.then && typeof promise.then === "function") {
        return promise.then(() => fn());
      }
      return fn();
    }
    _chainOrCallHooks(promise, event) {
      let result = promise;
      const hooks = [];
      this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== undefined).forEach((hookedCommand) => {
        hookedCommand._lifeCycleHooks[event].forEach((callback) => {
          hooks.push({ hookedCommand, callback });
        });
      });
      if (event === "postAction") {
        hooks.reverse();
      }
      hooks.forEach((hookDetail) => {
        result = this._chainOrCall(result, () => {
          return hookDetail.callback(hookDetail.hookedCommand, this);
        });
      });
      return result;
    }
    _chainOrCallSubCommandHook(promise, subCommand, event) {
      let result = promise;
      if (this._lifeCycleHooks[event] !== undefined) {
        this._lifeCycleHooks[event].forEach((hook) => {
          result = this._chainOrCall(result, () => {
            return hook(this, subCommand);
          });
        });
      }
      return result;
    }
    _parseCommand(operands, unknown) {
      const parsed = this.parseOptions(unknown);
      this._parseOptionsEnv();
      this._parseOptionsImplied();
      operands = operands.concat(parsed.operands);
      unknown = parsed.unknown;
      this.args = operands.concat(unknown);
      if (operands && this._findCommand(operands[0])) {
        return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
      }
      if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
        return this._dispatchHelpCommand(operands[1]);
      }
      if (this._defaultCommandName) {
        this._outputHelpIfRequested(unknown);
        return this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
      }
      if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
        this.help({ error: true });
      }
      this._outputHelpIfRequested(parsed.unknown);
      this._checkForMissingMandatoryOptions();
      this._checkForConflictingOptions();
      const checkForUnknownOptions = () => {
        if (parsed.unknown.length > 0) {
          this.unknownOption(parsed.unknown[0]);
        }
      };
      const commandEvent = `command:${this.name()}`;
      if (this._actionHandler) {
        checkForUnknownOptions();
        this._processArguments();
        let promiseChain;
        promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
        promiseChain = this._chainOrCall(promiseChain, () => this._actionHandler(this.processedArgs));
        if (this.parent) {
          promiseChain = this._chainOrCall(promiseChain, () => {
            this.parent.emit(commandEvent, operands, unknown);
          });
        }
        promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
        return promiseChain;
      }
      if (this.parent && this.parent.listenerCount(commandEvent)) {
        checkForUnknownOptions();
        this._processArguments();
        this.parent.emit(commandEvent, operands, unknown);
      } else if (operands.length) {
        if (this._findCommand("*")) {
          return this._dispatchSubcommand("*", operands, unknown);
        }
        if (this.listenerCount("command:*")) {
          this.emit("command:*", operands, unknown);
        } else if (this.commands.length) {
          this.unknownCommand();
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      } else if (this.commands.length) {
        checkForUnknownOptions();
        this.help({ error: true });
      } else {
        checkForUnknownOptions();
        this._processArguments();
      }
    }
    _findCommand(name) {
      if (!name)
        return;
      return this.commands.find((cmd) => cmd._name === name || cmd._aliases.includes(name));
    }
    _findOption(arg) {
      return this.options.find((option) => option.is(arg));
    }
    _checkForMissingMandatoryOptions() {
      this._getCommandAndAncestors().forEach((cmd) => {
        cmd.options.forEach((anOption) => {
          if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === undefined) {
            cmd.missingMandatoryOptionValue(anOption);
          }
        });
      });
    }
    _checkForConflictingLocalOptions() {
      const definedNonDefaultOptions = this.options.filter((option) => {
        const optionKey = option.attributeName();
        if (this.getOptionValue(optionKey) === undefined) {
          return false;
        }
        return this.getOptionValueSource(optionKey) !== "default";
      });
      const optionsWithConflicting = definedNonDefaultOptions.filter((option) => option.conflictsWith.length > 0);
      optionsWithConflicting.forEach((option) => {
        const conflictingAndDefined = definedNonDefaultOptions.find((defined) => option.conflictsWith.includes(defined.attributeName()));
        if (conflictingAndDefined) {
          this._conflictingOption(option, conflictingAndDefined);
        }
      });
    }
    _checkForConflictingOptions() {
      this._getCommandAndAncestors().forEach((cmd) => {
        cmd._checkForConflictingLocalOptions();
      });
    }
    parseOptions(argv) {
      const operands = [];
      const unknown = [];
      let dest = operands;
      const args = argv.slice();
      function maybeOption(arg) {
        return arg.length > 1 && arg[0] === "-";
      }
      let activeVariadicOption = null;
      while (args.length) {
        const arg = args.shift();
        if (arg === "--") {
          if (dest === unknown)
            dest.push(arg);
          dest.push(...args);
          break;
        }
        if (activeVariadicOption && !maybeOption(arg)) {
          this.emit(`option:${activeVariadicOption.name()}`, arg);
          continue;
        }
        activeVariadicOption = null;
        if (maybeOption(arg)) {
          const option = this._findOption(arg);
          if (option) {
            if (option.required) {
              const value = args.shift();
              if (value === undefined)
                this.optionMissingArgument(option);
              this.emit(`option:${option.name()}`, value);
            } else if (option.optional) {
              let value = null;
              if (args.length > 0 && !maybeOption(args[0])) {
                value = args.shift();
              }
              this.emit(`option:${option.name()}`, value);
            } else {
              this.emit(`option:${option.name()}`);
            }
            activeVariadicOption = option.variadic ? option : null;
            continue;
          }
        }
        if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
          const option = this._findOption(`-${arg[1]}`);
          if (option) {
            if (option.required || option.optional && this._combineFlagAndOptionalValue) {
              this.emit(`option:${option.name()}`, arg.slice(2));
            } else {
              this.emit(`option:${option.name()}`);
              args.unshift(`-${arg.slice(2)}`);
            }
            continue;
          }
        }
        if (/^--[^=]+=/.test(arg)) {
          const index = arg.indexOf("=");
          const option = this._findOption(arg.slice(0, index));
          if (option && (option.required || option.optional)) {
            this.emit(`option:${option.name()}`, arg.slice(index + 1));
            continue;
          }
        }
        if (maybeOption(arg)) {
          dest = unknown;
        }
        if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
          if (this._findCommand(arg)) {
            operands.push(arg);
            if (args.length > 0)
              unknown.push(...args);
            break;
          } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
            operands.push(arg);
            if (args.length > 0)
              operands.push(...args);
            break;
          } else if (this._defaultCommandName) {
            unknown.push(arg);
            if (args.length > 0)
              unknown.push(...args);
            break;
          }
        }
        if (this._passThroughOptions) {
          dest.push(arg);
          if (args.length > 0)
            dest.push(...args);
          break;
        }
        dest.push(arg);
      }
      return { operands, unknown };
    }
    opts() {
      if (this._storeOptionsAsProperties) {
        const result = {};
        const len = this.options.length;
        for (let i = 0;i < len; i++) {
          const key = this.options[i].attributeName();
          result[key] = key === this._versionOptionName ? this._version : this[key];
        }
        return result;
      }
      return this._optionValues;
    }
    optsWithGlobals() {
      return this._getCommandAndAncestors().reduce((combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()), {});
    }
    error(message, errorOptions) {
      this._outputConfiguration.outputError(`${message}
`, this._outputConfiguration.writeErr);
      if (typeof this._showHelpAfterError === "string") {
        this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
      } else if (this._showHelpAfterError) {
        this._outputConfiguration.writeErr(`
`);
        this.outputHelp({ error: true });
      }
      const config = errorOptions || {};
      const exitCode = config.exitCode || 1;
      const code = config.code || "commander.error";
      this._exit(exitCode, code, message);
    }
    _parseOptionsEnv() {
      this.options.forEach((option) => {
        if (option.envVar && option.envVar in process2.env) {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === undefined || ["default", "config", "env"].includes(this.getOptionValueSource(optionKey))) {
            if (option.required || option.optional) {
              this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
            } else {
              this.emit(`optionEnv:${option.name()}`);
            }
          }
        }
      });
    }
    _parseOptionsImplied() {
      const dualHelper = new DualOptions(this.options);
      const hasCustomOptionValue = (optionKey) => {
        return this.getOptionValue(optionKey) !== undefined && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
      };
      this.options.filter((option) => option.implied !== undefined && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(this.getOptionValue(option.attributeName()), option)).forEach((option) => {
        Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
          this.setOptionValueWithSource(impliedKey, option.implied[impliedKey], "implied");
        });
      });
    }
    missingArgument(name) {
      const message = `error: missing required argument '${name}'`;
      this.error(message, { code: "commander.missingArgument" });
    }
    optionMissingArgument(option) {
      const message = `error: option '${option.flags}' argument missing`;
      this.error(message, { code: "commander.optionMissingArgument" });
    }
    missingMandatoryOptionValue(option) {
      const message = `error: required option '${option.flags}' not specified`;
      this.error(message, { code: "commander.missingMandatoryOptionValue" });
    }
    _conflictingOption(option, conflictingOption) {
      const findBestOptionFromValue = (option2) => {
        const optionKey = option2.attributeName();
        const optionValue = this.getOptionValue(optionKey);
        const negativeOption = this.options.find((target) => target.negate && optionKey === target.attributeName());
        const positiveOption = this.options.find((target) => !target.negate && optionKey === target.attributeName());
        if (negativeOption && (negativeOption.presetArg === undefined && optionValue === false || negativeOption.presetArg !== undefined && optionValue === negativeOption.presetArg)) {
          return negativeOption;
        }
        return positiveOption || option2;
      };
      const getErrorMessage = (option2) => {
        const bestOption = findBestOptionFromValue(option2);
        const optionKey = bestOption.attributeName();
        const source = this.getOptionValueSource(optionKey);
        if (source === "env") {
          return `environment variable '${bestOption.envVar}'`;
        }
        return `option '${bestOption.flags}'`;
      };
      const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
      this.error(message, { code: "commander.conflictingOption" });
    }
    unknownOption(flag) {
      if (this._allowUnknownOption)
        return;
      let suggestion = "";
      if (flag.startsWith("--") && this._showSuggestionAfterError) {
        let candidateFlags = [];
        let command = this;
        do {
          const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
          candidateFlags = candidateFlags.concat(moreFlags);
          command = command.parent;
        } while (command && !command._enablePositionalOptions);
        suggestion = suggestSimilar(flag, candidateFlags);
      }
      const message = `error: unknown option '${flag}'${suggestion}`;
      this.error(message, { code: "commander.unknownOption" });
    }
    _excessArguments(receivedArgs) {
      if (this._allowExcessArguments)
        return;
      const expected = this.registeredArguments.length;
      const s = expected === 1 ? "" : "s";
      const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
      const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
      this.error(message, { code: "commander.excessArguments" });
    }
    unknownCommand() {
      const unknownName = this.args[0];
      let suggestion = "";
      if (this._showSuggestionAfterError) {
        const candidateNames = [];
        this.createHelp().visibleCommands(this).forEach((command) => {
          candidateNames.push(command.name());
          if (command.alias())
            candidateNames.push(command.alias());
        });
        suggestion = suggestSimilar(unknownName, candidateNames);
      }
      const message = `error: unknown command '${unknownName}'${suggestion}`;
      this.error(message, { code: "commander.unknownCommand" });
    }
    version(str, flags, description) {
      if (str === undefined)
        return this._version;
      this._version = str;
      flags = flags || "-V, --version";
      description = description || "output the version number";
      const versionOption = this.createOption(flags, description);
      this._versionOptionName = versionOption.attributeName();
      this._registerOption(versionOption);
      this.on("option:" + versionOption.name(), () => {
        this._outputConfiguration.writeOut(`${str}
`);
        this._exit(0, "commander.version", str);
      });
      return this;
    }
    description(str, argsDescription) {
      if (str === undefined && argsDescription === undefined)
        return this._description;
      this._description = str;
      if (argsDescription) {
        this._argsDescription = argsDescription;
      }
      return this;
    }
    summary(str) {
      if (str === undefined)
        return this._summary;
      this._summary = str;
      return this;
    }
    alias(alias) {
      if (alias === undefined)
        return this._aliases[0];
      let command = this;
      if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
        command = this.commands[this.commands.length - 1];
      }
      if (alias === command._name)
        throw new Error("Command alias can't be the same as its name");
      const matchingCommand = this.parent?._findCommand(alias);
      if (matchingCommand) {
        const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
        throw new Error(`cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`);
      }
      command._aliases.push(alias);
      return this;
    }
    aliases(aliases) {
      if (aliases === undefined)
        return this._aliases;
      aliases.forEach((alias) => this.alias(alias));
      return this;
    }
    usage(str) {
      if (str === undefined) {
        if (this._usage)
          return this._usage;
        const args = this.registeredArguments.map((arg) => {
          return humanReadableArgName(arg);
        });
        return [].concat(this.options.length || this._helpOption !== null ? "[options]" : [], this.commands.length ? "[command]" : [], this.registeredArguments.length ? args : []).join(" ");
      }
      this._usage = str;
      return this;
    }
    name(str) {
      if (str === undefined)
        return this._name;
      this._name = str;
      return this;
    }
    nameFromFilename(filename) {
      this._name = path.basename(filename, path.extname(filename));
      return this;
    }
    executableDir(path2) {
      if (path2 === undefined)
        return this._executableDir;
      this._executableDir = path2;
      return this;
    }
    helpInformation(contextOptions) {
      const helper = this.createHelp();
      if (helper.helpWidth === undefined) {
        helper.helpWidth = contextOptions && contextOptions.error ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
      }
      return helper.formatHelp(this, helper);
    }
    _getHelpContext(contextOptions) {
      contextOptions = contextOptions || {};
      const context = { error: !!contextOptions.error };
      let write;
      if (context.error) {
        write = (arg) => this._outputConfiguration.writeErr(arg);
      } else {
        write = (arg) => this._outputConfiguration.writeOut(arg);
      }
      context.write = contextOptions.write || write;
      context.command = this;
      return context;
    }
    outputHelp(contextOptions) {
      let deprecatedCallback;
      if (typeof contextOptions === "function") {
        deprecatedCallback = contextOptions;
        contextOptions = undefined;
      }
      const context = this._getHelpContext(contextOptions);
      this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", context));
      this.emit("beforeHelp", context);
      let helpInformation = this.helpInformation(context);
      if (deprecatedCallback) {
        helpInformation = deprecatedCallback(helpInformation);
        if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
          throw new Error("outputHelp callback must return a string or a Buffer");
        }
      }
      context.write(helpInformation);
      if (this._getHelpOption()?.long) {
        this.emit(this._getHelpOption().long);
      }
      this.emit("afterHelp", context);
      this._getCommandAndAncestors().forEach((command) => command.emit("afterAllHelp", context));
    }
    helpOption(flags, description) {
      if (typeof flags === "boolean") {
        if (flags) {
          this._helpOption = this._helpOption ?? undefined;
        } else {
          this._helpOption = null;
        }
        return this;
      }
      flags = flags ?? "-h, --help";
      description = description ?? "display help for command";
      this._helpOption = this.createOption(flags, description);
      return this;
    }
    _getHelpOption() {
      if (this._helpOption === undefined) {
        this.helpOption(undefined, undefined);
      }
      return this._helpOption;
    }
    addHelpOption(option) {
      this._helpOption = option;
      return this;
    }
    help(contextOptions) {
      this.outputHelp(contextOptions);
      let exitCode = process2.exitCode || 0;
      if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
        exitCode = 1;
      }
      this._exit(exitCode, "commander.help", "(outputHelp)");
    }
    addHelpText(position, text) {
      const allowedValues = ["beforeAll", "before", "after", "afterAll"];
      if (!allowedValues.includes(position)) {
        throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
      }
      const helpEvent = `${position}Help`;
      this.on(helpEvent, (context) => {
        let helpStr;
        if (typeof text === "function") {
          helpStr = text({ error: context.error, command: context.command });
        } else {
          helpStr = text;
        }
        if (helpStr) {
          context.write(`${helpStr}
`);
        }
      });
      return this;
    }
    _outputHelpIfRequested(args) {
      const helpOption = this._getHelpOption();
      const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
      if (helpRequested) {
        this.outputHelp();
        this._exit(0, "commander.helpDisplayed", "(outputHelp)");
      }
    }
  }
  function incrementNodeInspectorPort(args) {
    return args.map((arg) => {
      if (!arg.startsWith("--inspect")) {
        return arg;
      }
      let debugOption;
      let debugHost = "127.0.0.1";
      let debugPort = "9229";
      let match;
      if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
        debugOption = match[1];
      } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
        debugOption = match[1];
        if (/^\d+$/.test(match[3])) {
          debugPort = match[3];
        } else {
          debugHost = match[3];
        }
      } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
        debugOption = match[1];
        debugHost = match[3];
        debugPort = match[4];
      }
      if (debugOption && debugPort !== "0") {
        return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
      }
      return arg;
    });
  }
  exports.Command = Command;
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/index.js
var require_commander = __commonJS((exports) => {
  var { Argument } = require_argument();
  var { Command } = require_command();
  var { CommanderError, InvalidArgumentError } = require_error();
  var { Help } = require_help();
  var { Option } = require_option();
  exports.program = new Command;
  exports.createCommand = (name) => new Command(name);
  exports.createOption = (flags, description) => new Option(flags, description);
  exports.createArgument = (name, description) => new Argument(name, description);
  exports.Command = Command;
  exports.Option = Option;
  exports.Argument = Argument;
  exports.Help = Help;
  exports.CommanderError = CommanderError;
  exports.InvalidArgumentError = InvalidArgumentError;
  exports.InvalidOptionArgumentError = InvalidArgumentError;
});

// ../../node_modules/.pnpm/minimatch@5.1.6/node_modules/minimatch/lib/path.js
var require_path = __commonJS((exports, module) => {
  var isWindows = typeof process === "object" && process && process.platform === "win32";
  module.exports = isWindows ? { sep: "\\" } : { sep: "/" };
});

// ../../node_modules/.pnpm/balanced-match@1.0.2/node_modules/balanced-match/index.js
var require_balanced_match = __commonJS((exports, module) => {
  module.exports = balanced;
  function balanced(a, b, str) {
    if (a instanceof RegExp)
      a = maybeMatch(a, str);
    if (b instanceof RegExp)
      b = maybeMatch(b, str);
    var r = range(a, b, str);
    return r && {
      start: r[0],
      end: r[1],
      pre: str.slice(0, r[0]),
      body: str.slice(r[0] + a.length, r[1]),
      post: str.slice(r[1] + b.length)
    };
  }
  function maybeMatch(reg, str) {
    var m = str.match(reg);
    return m ? m[0] : null;
  }
  balanced.range = range;
  function range(a, b, str) {
    var begs, beg, left, right, result;
    var ai = str.indexOf(a);
    var bi = str.indexOf(b, ai + 1);
    var i = ai;
    if (ai >= 0 && bi > 0) {
      if (a === b) {
        return [ai, bi];
      }
      begs = [];
      left = str.length;
      while (i >= 0 && !result) {
        if (i == ai) {
          begs.push(i);
          ai = str.indexOf(a, i + 1);
        } else if (begs.length == 1) {
          result = [begs.pop(), bi];
        } else {
          beg = begs.pop();
          if (beg < left) {
            left = beg;
            right = bi;
          }
          bi = str.indexOf(b, i + 1);
        }
        i = ai < bi && ai >= 0 ? ai : bi;
      }
      if (begs.length) {
        result = [left, right];
      }
    }
    return result;
  }
});

// ../../node_modules/.pnpm/brace-expansion@2.0.2/node_modules/brace-expansion/index.js
var require_brace_expansion = __commonJS((exports, module) => {
  var balanced = require_balanced_match();
  module.exports = expandTop;
  var escSlash = "\x00SLASH" + Math.random() + "\x00";
  var escOpen = "\x00OPEN" + Math.random() + "\x00";
  var escClose = "\x00CLOSE" + Math.random() + "\x00";
  var escComma = "\x00COMMA" + Math.random() + "\x00";
  var escPeriod = "\x00PERIOD" + Math.random() + "\x00";
  function numeric(str) {
    return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
  }
  function escapeBraces(str) {
    return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
  }
  function unescapeBraces(str) {
    return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
  }
  function parseCommaParts(str) {
    if (!str)
      return [""];
    var parts = [];
    var m = balanced("{", "}", str);
    if (!m)
      return str.split(",");
    var pre = m.pre;
    var body = m.body;
    var post = m.post;
    var p = pre.split(",");
    p[p.length - 1] += "{" + body + "}";
    var postParts = parseCommaParts(post);
    if (post.length) {
      p[p.length - 1] += postParts.shift();
      p.push.apply(p, postParts);
    }
    parts.push.apply(parts, p);
    return parts;
  }
  function expandTop(str) {
    if (!str)
      return [];
    if (str.substr(0, 2) === "{}") {
      str = "\\{\\}" + str.substr(2);
    }
    return expand(escapeBraces(str), true).map(unescapeBraces);
  }
  function embrace(str) {
    return "{" + str + "}";
  }
  function isPadded(el) {
    return /^-?0\d/.test(el);
  }
  function lte(i, y) {
    return i <= y;
  }
  function gte(i, y) {
    return i >= y;
  }
  function expand(str, isTop) {
    var expansions = [];
    var m = balanced("{", "}", str);
    if (!m)
      return [str];
    var pre = m.pre;
    var post = m.post.length ? expand(m.post, false) : [""];
    if (/\$$/.test(m.pre)) {
      for (var k = 0;k < post.length; k++) {
        var expansion = pre + "{" + m.body + "}" + post[k];
        expansions.push(expansion);
      }
    } else {
      var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
      var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
      var isSequence = isNumericSequence || isAlphaSequence;
      var isOptions = m.body.indexOf(",") >= 0;
      if (!isSequence && !isOptions) {
        if (m.post.match(/,(?!,).*\}/)) {
          str = m.pre + "{" + m.body + escClose + m.post;
          return expand(str);
        }
        return [str];
      }
      var n;
      if (isSequence) {
        n = m.body.split(/\.\./);
      } else {
        n = parseCommaParts(m.body);
        if (n.length === 1) {
          n = expand(n[0], false).map(embrace);
          if (n.length === 1) {
            return post.map(function(p) {
              return m.pre + n[0] + p;
            });
          }
        }
      }
      var N;
      if (isSequence) {
        var x = numeric(n[0]);
        var y = numeric(n[1]);
        var width = Math.max(n[0].length, n[1].length);
        var incr = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
        var test = lte;
        var reverse = y < x;
        if (reverse) {
          incr *= -1;
          test = gte;
        }
        var pad = n.some(isPadded);
        N = [];
        for (var i = x;test(i, y); i += incr) {
          var c;
          if (isAlphaSequence) {
            c = String.fromCharCode(i);
            if (c === "\\")
              c = "";
          } else {
            c = String(i);
            if (pad) {
              var need = width - c.length;
              if (need > 0) {
                var z = new Array(need + 1).join("0");
                if (i < 0)
                  c = "-" + z + c.slice(1);
                else
                  c = z + c;
              }
            }
          }
          N.push(c);
        }
      } else {
        N = [];
        for (var j = 0;j < n.length; j++) {
          N.push.apply(N, expand(n[j], false));
        }
      }
      for (var j = 0;j < N.length; j++) {
        for (var k = 0;k < post.length; k++) {
          var expansion = pre + N[j] + post[k];
          if (!isTop || isSequence || expansion)
            expansions.push(expansion);
        }
      }
    }
    return expansions;
  }
});

// ../../node_modules/.pnpm/minimatch@5.1.6/node_modules/minimatch/minimatch.js
var require_minimatch = __commonJS((exports, module) => {
  var minimatch = module.exports = (p, pattern, options = {}) => {
    assertValidPattern(pattern);
    if (!options.nocomment && pattern.charAt(0) === "#") {
      return false;
    }
    return new Minimatch(pattern, options).match(p);
  };
  module.exports = minimatch;
  var path = require_path();
  minimatch.sep = path.sep;
  var GLOBSTAR = Symbol("globstar **");
  minimatch.GLOBSTAR = GLOBSTAR;
  var expand = require_brace_expansion();
  var plTypes = {
    "!": { open: "(?:(?!(?:", close: "))[^/]*?)" },
    "?": { open: "(?:", close: ")?" },
    "+": { open: "(?:", close: ")+" },
    "*": { open: "(?:", close: ")*" },
    "@": { open: "(?:", close: ")" }
  };
  var qmark = "[^/]";
  var star = qmark + "*?";
  var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
  var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
  var charSet = (s) => s.split("").reduce((set, c) => {
    set[c] = true;
    return set;
  }, {});
  var reSpecials = charSet("().*{}+?[]^$\\!");
  var addPatternStartSet = charSet("[.(");
  var slashSplit = /\/+/;
  minimatch.filter = (pattern, options = {}) => (p, i, list) => minimatch(p, pattern, options);
  var ext = (a, b = {}) => {
    const t = {};
    Object.keys(a).forEach((k) => t[k] = a[k]);
    Object.keys(b).forEach((k) => t[k] = b[k]);
    return t;
  };
  minimatch.defaults = (def) => {
    if (!def || typeof def !== "object" || !Object.keys(def).length) {
      return minimatch;
    }
    const orig = minimatch;
    const m = (p, pattern, options) => orig(p, pattern, ext(def, options));
    m.Minimatch = class Minimatch2 extends orig.Minimatch {
      constructor(pattern, options) {
        super(pattern, ext(def, options));
      }
    };
    m.Minimatch.defaults = (options) => orig.defaults(ext(def, options)).Minimatch;
    m.filter = (pattern, options) => orig.filter(pattern, ext(def, options));
    m.defaults = (options) => orig.defaults(ext(def, options));
    m.makeRe = (pattern, options) => orig.makeRe(pattern, ext(def, options));
    m.braceExpand = (pattern, options) => orig.braceExpand(pattern, ext(def, options));
    m.match = (list, pattern, options) => orig.match(list, pattern, ext(def, options));
    return m;
  };
  minimatch.braceExpand = (pattern, options) => braceExpand(pattern, options);
  var braceExpand = (pattern, options = {}) => {
    assertValidPattern(pattern);
    if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
      return [pattern];
    }
    return expand(pattern);
  };
  var MAX_PATTERN_LENGTH = 1024 * 64;
  var assertValidPattern = (pattern) => {
    if (typeof pattern !== "string") {
      throw new TypeError("invalid pattern");
    }
    if (pattern.length > MAX_PATTERN_LENGTH) {
      throw new TypeError("pattern is too long");
    }
  };
  var SUBPARSE = Symbol("subparse");
  minimatch.makeRe = (pattern, options) => new Minimatch(pattern, options || {}).makeRe();
  minimatch.match = (list, pattern, options = {}) => {
    const mm = new Minimatch(pattern, options);
    list = list.filter((f) => mm.match(f));
    if (mm.options.nonull && !list.length) {
      list.push(pattern);
    }
    return list;
  };
  var globUnescape = (s) => s.replace(/\\(.)/g, "$1");
  var charUnescape = (s) => s.replace(/\\([^-\]])/g, "$1");
  var regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  var braExpEscape = (s) => s.replace(/[[\]\\]/g, "\\$&");

  class Minimatch {
    constructor(pattern, options) {
      assertValidPattern(pattern);
      if (!options)
        options = {};
      this.options = options;
      this.set = [];
      this.pattern = pattern;
      this.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options.allowWindowsEscape === false;
      if (this.windowsPathsNoEscape) {
        this.pattern = this.pattern.replace(/\\/g, "/");
      }
      this.regexp = null;
      this.negate = false;
      this.comment = false;
      this.empty = false;
      this.partial = !!options.partial;
      this.make();
    }
    debug() {}
    make() {
      const pattern = this.pattern;
      const options = this.options;
      if (!options.nocomment && pattern.charAt(0) === "#") {
        this.comment = true;
        return;
      }
      if (!pattern) {
        this.empty = true;
        return;
      }
      this.parseNegate();
      let set = this.globSet = this.braceExpand();
      if (options.debug)
        this.debug = (...args) => console.error(...args);
      this.debug(this.pattern, set);
      set = this.globParts = set.map((s) => s.split(slashSplit));
      this.debug(this.pattern, set);
      set = set.map((s, si, set2) => s.map(this.parse, this));
      this.debug(this.pattern, set);
      set = set.filter((s) => s.indexOf(false) === -1);
      this.debug(this.pattern, set);
      this.set = set;
    }
    parseNegate() {
      if (this.options.nonegate)
        return;
      const pattern = this.pattern;
      let negate = false;
      let negateOffset = 0;
      for (let i = 0;i < pattern.length && pattern.charAt(i) === "!"; i++) {
        negate = !negate;
        negateOffset++;
      }
      if (negateOffset)
        this.pattern = pattern.slice(negateOffset);
      this.negate = negate;
    }
    matchOne(file, pattern, partial) {
      var options = this.options;
      this.debug("matchOne", { this: this, file, pattern });
      this.debug("matchOne", file.length, pattern.length);
      for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length;fi < fl && pi < pl; fi++, pi++) {
        this.debug("matchOne loop");
        var p = pattern[pi];
        var f = file[fi];
        this.debug(pattern, p, f);
        if (p === false)
          return false;
        if (p === GLOBSTAR) {
          this.debug("GLOBSTAR", [pattern, p, f]);
          var fr = fi;
          var pr = pi + 1;
          if (pr === pl) {
            this.debug("** at the end");
            for (;fi < fl; fi++) {
              if (file[fi] === "." || file[fi] === ".." || !options.dot && file[fi].charAt(0) === ".")
                return false;
            }
            return true;
          }
          while (fr < fl) {
            var swallowee = file[fr];
            this.debug(`
globstar while`, file, fr, pattern, pr, swallowee);
            if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
              this.debug("globstar found match!", fr, fl, swallowee);
              return true;
            } else {
              if (swallowee === "." || swallowee === ".." || !options.dot && swallowee.charAt(0) === ".") {
                this.debug("dot detected!", file, fr, pattern, pr);
                break;
              }
              this.debug("globstar swallow a segment, and continue");
              fr++;
            }
          }
          if (partial) {
            this.debug(`
>>> no match, partial?`, file, fr, pattern, pr);
            if (fr === fl)
              return true;
          }
          return false;
        }
        var hit;
        if (typeof p === "string") {
          hit = f === p;
          this.debug("string match", p, f, hit);
        } else {
          hit = f.match(p);
          this.debug("pattern match", p, f, hit);
        }
        if (!hit)
          return false;
      }
      if (fi === fl && pi === pl) {
        return true;
      } else if (fi === fl) {
        return partial;
      } else if (pi === pl) {
        return fi === fl - 1 && file[fi] === "";
      }
      throw new Error("wtf?");
    }
    braceExpand() {
      return braceExpand(this.pattern, this.options);
    }
    parse(pattern, isSub) {
      assertValidPattern(pattern);
      const options = this.options;
      if (pattern === "**") {
        if (!options.noglobstar)
          return GLOBSTAR;
        else
          pattern = "*";
      }
      if (pattern === "")
        return "";
      let re = "";
      let hasMagic = false;
      let escaping = false;
      const patternListStack = [];
      const negativeLists = [];
      let stateChar;
      let inClass = false;
      let reClassStart = -1;
      let classStart = -1;
      let cs;
      let pl;
      let sp;
      let dotTravAllowed = pattern.charAt(0) === ".";
      let dotFileAllowed = options.dot || dotTravAllowed;
      const patternStart = () => dotTravAllowed ? "" : dotFileAllowed ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)";
      const subPatternStart = (p) => p.charAt(0) === "." ? "" : options.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)";
      const clearStateChar = () => {
        if (stateChar) {
          switch (stateChar) {
            case "*":
              re += star;
              hasMagic = true;
              break;
            case "?":
              re += qmark;
              hasMagic = true;
              break;
            default:
              re += "\\" + stateChar;
              break;
          }
          this.debug("clearStateChar %j %j", stateChar, re);
          stateChar = false;
        }
      };
      for (let i = 0, c;i < pattern.length && (c = pattern.charAt(i)); i++) {
        this.debug("%s	%s %s %j", pattern, i, re, c);
        if (escaping) {
          if (c === "/") {
            return false;
          }
          if (reSpecials[c]) {
            re += "\\";
          }
          re += c;
          escaping = false;
          continue;
        }
        switch (c) {
          case "/": {
            return false;
          }
          case "\\":
            if (inClass && pattern.charAt(i + 1) === "-") {
              re += c;
              continue;
            }
            clearStateChar();
            escaping = true;
            continue;
          case "?":
          case "*":
          case "+":
          case "@":
          case "!":
            this.debug("%s\t%s %s %j <-- stateChar", pattern, i, re, c);
            if (inClass) {
              this.debug("  in class");
              if (c === "!" && i === classStart + 1)
                c = "^";
              re += c;
              continue;
            }
            this.debug("call clearStateChar %j", stateChar);
            clearStateChar();
            stateChar = c;
            if (options.noext)
              clearStateChar();
            continue;
          case "(": {
            if (inClass) {
              re += "(";
              continue;
            }
            if (!stateChar) {
              re += "\\(";
              continue;
            }
            const plEntry = {
              type: stateChar,
              start: i - 1,
              reStart: re.length,
              open: plTypes[stateChar].open,
              close: plTypes[stateChar].close
            };
            this.debug(this.pattern, "\t", plEntry);
            patternListStack.push(plEntry);
            re += plEntry.open;
            if (plEntry.start === 0 && plEntry.type !== "!") {
              dotTravAllowed = true;
              re += subPatternStart(pattern.slice(i + 1));
            }
            this.debug("plType %j %j", stateChar, re);
            stateChar = false;
            continue;
          }
          case ")": {
            const plEntry = patternListStack[patternListStack.length - 1];
            if (inClass || !plEntry) {
              re += "\\)";
              continue;
            }
            patternListStack.pop();
            clearStateChar();
            hasMagic = true;
            pl = plEntry;
            re += pl.close;
            if (pl.type === "!") {
              negativeLists.push(Object.assign(pl, { reEnd: re.length }));
            }
            continue;
          }
          case "|": {
            const plEntry = patternListStack[patternListStack.length - 1];
            if (inClass || !plEntry) {
              re += "\\|";
              continue;
            }
            clearStateChar();
            re += "|";
            if (plEntry.start === 0 && plEntry.type !== "!") {
              dotTravAllowed = true;
              re += subPatternStart(pattern.slice(i + 1));
            }
            continue;
          }
          case "[":
            clearStateChar();
            if (inClass) {
              re += "\\" + c;
              continue;
            }
            inClass = true;
            classStart = i;
            reClassStart = re.length;
            re += c;
            continue;
          case "]":
            if (i === classStart + 1 || !inClass) {
              re += "\\" + c;
              continue;
            }
            cs = pattern.substring(classStart + 1, i);
            try {
              RegExp("[" + braExpEscape(charUnescape(cs)) + "]");
              re += c;
            } catch (er) {
              re = re.substring(0, reClassStart) + "(?:$.)";
            }
            hasMagic = true;
            inClass = false;
            continue;
          default:
            clearStateChar();
            if (reSpecials[c] && !(c === "^" && inClass)) {
              re += "\\";
            }
            re += c;
            break;
        }
      }
      if (inClass) {
        cs = pattern.slice(classStart + 1);
        sp = this.parse(cs, SUBPARSE);
        re = re.substring(0, reClassStart) + "\\[" + sp[0];
        hasMagic = hasMagic || sp[1];
      }
      for (pl = patternListStack.pop();pl; pl = patternListStack.pop()) {
        let tail;
        tail = re.slice(pl.reStart + pl.open.length);
        this.debug("setting tail", re, pl);
        tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, (_2, $1, $2) => {
          if (!$2) {
            $2 = "\\";
          }
          return $1 + $1 + $2 + "|";
        });
        this.debug(`tail=%j
   %s`, tail, tail, pl, re);
        const t = pl.type === "*" ? star : pl.type === "?" ? qmark : "\\" + pl.type;
        hasMagic = true;
        re = re.slice(0, pl.reStart) + t + "\\(" + tail;
      }
      clearStateChar();
      if (escaping) {
        re += "\\\\";
      }
      const addPatternStart = addPatternStartSet[re.charAt(0)];
      for (let n = negativeLists.length - 1;n > -1; n--) {
        const nl = negativeLists[n];
        const nlBefore = re.slice(0, nl.reStart);
        const nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
        let nlAfter = re.slice(nl.reEnd);
        const nlLast = re.slice(nl.reEnd - 8, nl.reEnd) + nlAfter;
        const closeParensBefore = nlBefore.split(")").length;
        const openParensBefore = nlBefore.split("(").length - closeParensBefore;
        let cleanAfter = nlAfter;
        for (let i = 0;i < openParensBefore; i++) {
          cleanAfter = cleanAfter.replace(/\)[+*?]?/, "");
        }
        nlAfter = cleanAfter;
        const dollar = nlAfter === "" && isSub !== SUBPARSE ? "(?:$|\\/)" : "";
        re = nlBefore + nlFirst + nlAfter + dollar + nlLast;
      }
      if (re !== "" && hasMagic) {
        re = "(?=.)" + re;
      }
      if (addPatternStart) {
        re = patternStart() + re;
      }
      if (isSub === SUBPARSE) {
        return [re, hasMagic];
      }
      if (options.nocase && !hasMagic) {
        hasMagic = pattern.toUpperCase() !== pattern.toLowerCase();
      }
      if (!hasMagic) {
        return globUnescape(pattern);
      }
      const flags = options.nocase ? "i" : "";
      try {
        return Object.assign(new RegExp("^" + re + "$", flags), {
          _glob: pattern,
          _src: re
        });
      } catch (er) {
        return new RegExp("$.");
      }
    }
    makeRe() {
      if (this.regexp || this.regexp === false)
        return this.regexp;
      const set = this.set;
      if (!set.length) {
        this.regexp = false;
        return this.regexp;
      }
      const options = this.options;
      const twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
      const flags = options.nocase ? "i" : "";
      let re = set.map((pattern) => {
        pattern = pattern.map((p) => typeof p === "string" ? regExpEscape(p) : p === GLOBSTAR ? GLOBSTAR : p._src).reduce((set2, p) => {
          if (!(set2[set2.length - 1] === GLOBSTAR && p === GLOBSTAR)) {
            set2.push(p);
          }
          return set2;
        }, []);
        pattern.forEach((p, i) => {
          if (p !== GLOBSTAR || pattern[i - 1] === GLOBSTAR) {
            return;
          }
          if (i === 0) {
            if (pattern.length > 1) {
              pattern[i + 1] = "(?:\\/|" + twoStar + "\\/)?" + pattern[i + 1];
            } else {
              pattern[i] = twoStar;
            }
          } else if (i === pattern.length - 1) {
            pattern[i - 1] += "(?:\\/|" + twoStar + ")?";
          } else {
            pattern[i - 1] += "(?:\\/|\\/" + twoStar + "\\/)" + pattern[i + 1];
            pattern[i + 1] = GLOBSTAR;
          }
        });
        return pattern.filter((p) => p !== GLOBSTAR).join("/");
      }).join("|");
      re = "^(?:" + re + ")$";
      if (this.negate)
        re = "^(?!" + re + ").*$";
      try {
        this.regexp = new RegExp(re, flags);
      } catch (ex) {
        this.regexp = false;
      }
      return this.regexp;
    }
    match(f, partial = this.partial) {
      this.debug("match", f, this.pattern);
      if (this.comment)
        return false;
      if (this.empty)
        return f === "";
      if (f === "/" && partial)
        return true;
      const options = this.options;
      if (path.sep !== "/") {
        f = f.split(path.sep).join("/");
      }
      f = f.split(slashSplit);
      this.debug(this.pattern, "split", f);
      const set = this.set;
      this.debug(this.pattern, "set", set);
      let filename;
      for (let i = f.length - 1;i >= 0; i--) {
        filename = f[i];
        if (filename)
          break;
      }
      for (let i = 0;i < set.length; i++) {
        const pattern = set[i];
        let file = f;
        if (options.matchBase && pattern.length === 1) {
          file = [filename];
        }
        const hit = this.matchOne(file, pattern, partial);
        if (hit) {
          if (options.flipNegate)
            return true;
          return !this.negate;
        }
      }
      if (options.flipNegate)
        return false;
      return this.negate;
    }
    static defaults(def) {
      return minimatch.defaults(def).Minimatch;
    }
  }
  minimatch.Minimatch = Minimatch;
});

// ../../node_modules/.pnpm/readdir-glob@1.1.3/node_modules/readdir-glob/index.js
var require_readdir_glob = __commonJS((exports, module) => {
  module.exports = readdirGlob;
  var fs = __require("fs");
  var { EventEmitter } = __require("events");
  var { Minimatch } = require_minimatch();
  var { resolve } = __require("path");
  function readdir(dir, strict) {
    return new Promise((resolve2, reject) => {
      fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) {
          switch (err.code) {
            case "ENOTDIR":
              if (strict) {
                reject(err);
              } else {
                resolve2([]);
              }
              break;
            case "ENOTSUP":
            case "ENOENT":
            case "ENAMETOOLONG":
            case "UNKNOWN":
              resolve2([]);
              break;
            case "ELOOP":
            default:
              reject(err);
              break;
          }
        } else {
          resolve2(files);
        }
      });
    });
  }
  function stat(file, followSymlinks) {
    return new Promise((resolve2, reject) => {
      const statFunc = followSymlinks ? fs.stat : fs.lstat;
      statFunc(file, (err, stats) => {
        if (err) {
          switch (err.code) {
            case "ENOENT":
              if (followSymlinks) {
                resolve2(stat(file, false));
              } else {
                resolve2(null);
              }
              break;
            default:
              resolve2(null);
              break;
          }
        } else {
          resolve2(stats);
        }
      });
    });
  }
  async function* exploreWalkAsync(dir, path, followSymlinks, useStat, shouldSkip, strict) {
    let files = await readdir(path + dir, strict);
    for (const file of files) {
      let name = file.name;
      if (name === undefined) {
        name = file;
        useStat = true;
      }
      const filename = dir + "/" + name;
      const relative = filename.slice(1);
      const absolute = path + "/" + relative;
      let stats = null;
      if (useStat || followSymlinks) {
        stats = await stat(absolute, followSymlinks);
      }
      if (!stats && file.name !== undefined) {
        stats = file;
      }
      if (stats === null) {
        stats = { isDirectory: () => false };
      }
      if (stats.isDirectory()) {
        if (!shouldSkip(relative)) {
          yield { relative, absolute, stats };
          yield* exploreWalkAsync(filename, path, followSymlinks, useStat, shouldSkip, false);
        }
      } else {
        yield { relative, absolute, stats };
      }
    }
  }
  async function* explore(path, followSymlinks, useStat, shouldSkip) {
    yield* exploreWalkAsync("", path, followSymlinks, useStat, shouldSkip, true);
  }
  function readOptions(options) {
    return {
      pattern: options.pattern,
      dot: !!options.dot,
      noglobstar: !!options.noglobstar,
      matchBase: !!options.matchBase,
      nocase: !!options.nocase,
      ignore: options.ignore,
      skip: options.skip,
      follow: !!options.follow,
      stat: !!options.stat,
      nodir: !!options.nodir,
      mark: !!options.mark,
      silent: !!options.silent,
      absolute: !!options.absolute
    };
  }

  class ReaddirGlob extends EventEmitter {
    constructor(cwd, options, cb) {
      super();
      if (typeof options === "function") {
        cb = options;
        options = null;
      }
      this.options = readOptions(options || {});
      this.matchers = [];
      if (this.options.pattern) {
        const matchers = Array.isArray(this.options.pattern) ? this.options.pattern : [this.options.pattern];
        this.matchers = matchers.map((m) => new Minimatch(m, {
          dot: this.options.dot,
          noglobstar: this.options.noglobstar,
          matchBase: this.options.matchBase,
          nocase: this.options.nocase
        }));
      }
      this.ignoreMatchers = [];
      if (this.options.ignore) {
        const ignorePatterns = Array.isArray(this.options.ignore) ? this.options.ignore : [this.options.ignore];
        this.ignoreMatchers = ignorePatterns.map((ignore) => new Minimatch(ignore, { dot: true }));
      }
      this.skipMatchers = [];
      if (this.options.skip) {
        const skipPatterns = Array.isArray(this.options.skip) ? this.options.skip : [this.options.skip];
        this.skipMatchers = skipPatterns.map((skip) => new Minimatch(skip, { dot: true }));
      }
      this.iterator = explore(resolve(cwd || "."), this.options.follow, this.options.stat, this._shouldSkipDirectory.bind(this));
      this.paused = false;
      this.inactive = false;
      this.aborted = false;
      if (cb) {
        this._matches = [];
        this.on("match", (match) => this._matches.push(this.options.absolute ? match.absolute : match.relative));
        this.on("error", (err) => cb(err));
        this.on("end", () => cb(null, this._matches));
      }
      setTimeout(() => this._next(), 0);
    }
    _shouldSkipDirectory(relative) {
      return this.skipMatchers.some((m) => m.match(relative));
    }
    _fileMatches(relative, isDirectory) {
      const file = relative + (isDirectory ? "/" : "");
      return (this.matchers.length === 0 || this.matchers.some((m) => m.match(file))) && !this.ignoreMatchers.some((m) => m.match(file)) && (!this.options.nodir || !isDirectory);
    }
    _next() {
      if (!this.paused && !this.aborted) {
        this.iterator.next().then((obj) => {
          if (!obj.done) {
            const isDirectory = obj.value.stats.isDirectory();
            if (this._fileMatches(obj.value.relative, isDirectory)) {
              let relative = obj.value.relative;
              let absolute = obj.value.absolute;
              if (this.options.mark && isDirectory) {
                relative += "/";
                absolute += "/";
              }
              if (this.options.stat) {
                this.emit("match", { relative, absolute, stat: obj.value.stats });
              } else {
                this.emit("match", { relative, absolute });
              }
            }
            this._next(this.iterator);
          } else {
            this.emit("end");
          }
        }).catch((err) => {
          this.abort();
          this.emit("error", err);
          if (!err.code && !this.options.silent) {
            console.error(err);
          }
        });
      } else {
        this.inactive = true;
      }
    }
    abort() {
      this.aborted = true;
    }
    pause() {
      this.paused = true;
    }
    resume() {
      this.paused = false;
      if (this.inactive) {
        this.inactive = false;
        this._next();
      }
    }
  }
  function readdirGlob(pattern, options, cb) {
    return new ReaddirGlob(pattern, options, cb);
  }
  readdirGlob.ReaddirGlob = ReaddirGlob;
});

// ../../node_modules/.pnpm/async@3.2.6/node_modules/async/dist/async.js
var require_async = __commonJS((exports, module) => {
  (function(global2, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, factory(global2.async = {}));
  })(exports, function(exports2) {
    function apply(fn, ...args) {
      return (...callArgs) => fn(...args, ...callArgs);
    }
    function initialParams(fn) {
      return function(...args) {
        var callback = args.pop();
        return fn.call(this, args, callback);
      };
    }
    var hasQueueMicrotask = typeof queueMicrotask === "function" && queueMicrotask;
    var hasSetImmediate = typeof setImmediate === "function" && setImmediate;
    var hasNextTick = typeof process === "object" && typeof process.nextTick === "function";
    function fallback(fn) {
      setTimeout(fn, 0);
    }
    function wrap(defer) {
      return (fn, ...args) => defer(() => fn(...args));
    }
    var _defer$1;
    if (hasQueueMicrotask) {
      _defer$1 = queueMicrotask;
    } else if (hasSetImmediate) {
      _defer$1 = setImmediate;
    } else if (hasNextTick) {
      _defer$1 = process.nextTick;
    } else {
      _defer$1 = fallback;
    }
    var setImmediate$1 = wrap(_defer$1);
    function asyncify(func) {
      if (isAsync(func)) {
        return function(...args) {
          const callback = args.pop();
          const promise = func.apply(this, args);
          return handlePromise(promise, callback);
        };
      }
      return initialParams(function(args, callback) {
        var result;
        try {
          result = func.apply(this, args);
        } catch (e) {
          return callback(e);
        }
        if (result && typeof result.then === "function") {
          return handlePromise(result, callback);
        } else {
          callback(null, result);
        }
      });
    }
    function handlePromise(promise, callback) {
      return promise.then((value) => {
        invokeCallback(callback, null, value);
      }, (err) => {
        invokeCallback(callback, err && (err instanceof Error || err.message) ? err : new Error(err));
      });
    }
    function invokeCallback(callback, error, value) {
      try {
        callback(error, value);
      } catch (err) {
        setImmediate$1((e) => {
          throw e;
        }, err);
      }
    }
    function isAsync(fn) {
      return fn[Symbol.toStringTag] === "AsyncFunction";
    }
    function isAsyncGenerator(fn) {
      return fn[Symbol.toStringTag] === "AsyncGenerator";
    }
    function isAsyncIterable(obj) {
      return typeof obj[Symbol.asyncIterator] === "function";
    }
    function wrapAsync(asyncFn) {
      if (typeof asyncFn !== "function")
        throw new Error("expected a function");
      return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
    }
    function awaitify(asyncFn, arity) {
      if (!arity)
        arity = asyncFn.length;
      if (!arity)
        throw new Error("arity is undefined");
      function awaitable(...args) {
        if (typeof args[arity - 1] === "function") {
          return asyncFn.apply(this, args);
        }
        return new Promise((resolve, reject2) => {
          args[arity - 1] = (err, ...cbArgs) => {
            if (err)
              return reject2(err);
            resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0]);
          };
          asyncFn.apply(this, args);
        });
      }
      return awaitable;
    }
    function applyEach$1(eachfn) {
      return function applyEach(fns, ...callArgs) {
        const go = awaitify(function(callback) {
          var that = this;
          return eachfn(fns, (fn, cb) => {
            wrapAsync(fn).apply(that, callArgs.concat(cb));
          }, callback);
        });
        return go;
      };
    }
    function _asyncMap(eachfn, arr, iteratee, callback) {
      arr = arr || [];
      var results = [];
      var counter = 0;
      var _iteratee = wrapAsync(iteratee);
      return eachfn(arr, (value, _2, iterCb) => {
        var index2 = counter++;
        _iteratee(value, (err, v) => {
          results[index2] = v;
          iterCb(err);
        });
      }, (err) => {
        callback(err, results);
      });
    }
    function isArrayLike(value) {
      return value && typeof value.length === "number" && value.length >= 0 && value.length % 1 === 0;
    }
    const breakLoop = {};
    function once(fn) {
      function wrapper(...args) {
        if (fn === null)
          return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, args);
      }
      Object.assign(wrapper, fn);
      return wrapper;
    }
    function getIterator(coll) {
      return coll[Symbol.iterator] && coll[Symbol.iterator]();
    }
    function createArrayIterator(coll) {
      var i = -1;
      var len = coll.length;
      return function next() {
        return ++i < len ? { value: coll[i], key: i } : null;
      };
    }
    function createES2015Iterator(iterator) {
      var i = -1;
      return function next() {
        var item = iterator.next();
        if (item.done)
          return null;
        i++;
        return { value: item.value, key: i };
      };
    }
    function createObjectIterator(obj) {
      var okeys = obj ? Object.keys(obj) : [];
      var i = -1;
      var len = okeys.length;
      return function next() {
        var key = okeys[++i];
        if (key === "__proto__") {
          return next();
        }
        return i < len ? { value: obj[key], key } : null;
      };
    }
    function createIterator(coll) {
      if (isArrayLike(coll)) {
        return createArrayIterator(coll);
      }
      var iterator = getIterator(coll);
      return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
    }
    function onlyOnce(fn) {
      return function(...args) {
        if (fn === null)
          throw new Error("Callback was already called.");
        var callFn = fn;
        fn = null;
        callFn.apply(this, args);
      };
    }
    function asyncEachOfLimit(generator, limit, iteratee, callback) {
      let done = false;
      let canceled = false;
      let awaiting = false;
      let running = 0;
      let idx = 0;
      function replenish() {
        if (running >= limit || awaiting || done)
          return;
        awaiting = true;
        generator.next().then(({ value, done: iterDone }) => {
          if (canceled || done)
            return;
          awaiting = false;
          if (iterDone) {
            done = true;
            if (running <= 0) {
              callback(null);
            }
            return;
          }
          running++;
          iteratee(value, idx, iterateeCallback);
          idx++;
          replenish();
        }).catch(handleError);
      }
      function iterateeCallback(err, result) {
        running -= 1;
        if (canceled)
          return;
        if (err)
          return handleError(err);
        if (err === false) {
          done = true;
          canceled = true;
          return;
        }
        if (result === breakLoop || done && running <= 0) {
          done = true;
          return callback(null);
        }
        replenish();
      }
      function handleError(err) {
        if (canceled)
          return;
        awaiting = false;
        done = true;
        callback(err);
      }
      replenish();
    }
    var eachOfLimit$2 = (limit) => {
      return (obj, iteratee, callback) => {
        callback = once(callback);
        if (limit <= 0) {
          throw new RangeError("concurrency limit cannot be less than 1");
        }
        if (!obj) {
          return callback(null);
        }
        if (isAsyncGenerator(obj)) {
          return asyncEachOfLimit(obj, limit, iteratee, callback);
        }
        if (isAsyncIterable(obj)) {
          return asyncEachOfLimit(obj[Symbol.asyncIterator](), limit, iteratee, callback);
        }
        var nextElem = createIterator(obj);
        var done = false;
        var canceled = false;
        var running = 0;
        var looping = false;
        function iterateeCallback(err, value) {
          if (canceled)
            return;
          running -= 1;
          if (err) {
            done = true;
            callback(err);
          } else if (err === false) {
            done = true;
            canceled = true;
          } else if (value === breakLoop || done && running <= 0) {
            done = true;
            return callback(null);
          } else if (!looping) {
            replenish();
          }
        }
        function replenish() {
          looping = true;
          while (running < limit && !done) {
            var elem = nextElem();
            if (elem === null) {
              done = true;
              if (running <= 0) {
                callback(null);
              }
              return;
            }
            running += 1;
            iteratee(elem.value, elem.key, onlyOnce(iterateeCallback));
          }
          looping = false;
        }
        replenish();
      };
    };
    function eachOfLimit(coll, limit, iteratee, callback) {
      return eachOfLimit$2(limit)(coll, wrapAsync(iteratee), callback);
    }
    var eachOfLimit$1 = awaitify(eachOfLimit, 4);
    function eachOfArrayLike(coll, iteratee, callback) {
      callback = once(callback);
      var index2 = 0, completed = 0, { length } = coll, canceled = false;
      if (length === 0) {
        callback(null);
      }
      function iteratorCallback(err, value) {
        if (err === false) {
          canceled = true;
        }
        if (canceled === true)
          return;
        if (err) {
          callback(err);
        } else if (++completed === length || value === breakLoop) {
          callback(null);
        }
      }
      for (;index2 < length; index2++) {
        iteratee(coll[index2], index2, onlyOnce(iteratorCallback));
      }
    }
    function eachOfGeneric(coll, iteratee, callback) {
      return eachOfLimit$1(coll, Infinity, iteratee, callback);
    }
    function eachOf(coll, iteratee, callback) {
      var eachOfImplementation = isArrayLike(coll) ? eachOfArrayLike : eachOfGeneric;
      return eachOfImplementation(coll, wrapAsync(iteratee), callback);
    }
    var eachOf$1 = awaitify(eachOf, 3);
    function map(coll, iteratee, callback) {
      return _asyncMap(eachOf$1, coll, iteratee, callback);
    }
    var map$1 = awaitify(map, 3);
    var applyEach = applyEach$1(map$1);
    function eachOfSeries(coll, iteratee, callback) {
      return eachOfLimit$1(coll, 1, iteratee, callback);
    }
    var eachOfSeries$1 = awaitify(eachOfSeries, 3);
    function mapSeries(coll, iteratee, callback) {
      return _asyncMap(eachOfSeries$1, coll, iteratee, callback);
    }
    var mapSeries$1 = awaitify(mapSeries, 3);
    var applyEachSeries = applyEach$1(mapSeries$1);
    const PROMISE_SYMBOL = Symbol("promiseCallback");
    function promiseCallback() {
      let resolve, reject2;
      function callback(err, ...args) {
        if (err)
          return reject2(err);
        resolve(args.length > 1 ? args : args[0]);
      }
      callback[PROMISE_SYMBOL] = new Promise((res, rej) => {
        resolve = res, reject2 = rej;
      });
      return callback;
    }
    function auto(tasks, concurrency, callback) {
      if (typeof concurrency !== "number") {
        callback = concurrency;
        concurrency = null;
      }
      callback = once(callback || promiseCallback());
      var numTasks = Object.keys(tasks).length;
      if (!numTasks) {
        return callback(null);
      }
      if (!concurrency) {
        concurrency = numTasks;
      }
      var results = {};
      var runningTasks = 0;
      var canceled = false;
      var hasError = false;
      var listeners = Object.create(null);
      var readyTasks = [];
      var readyToCheck = [];
      var uncheckedDependencies = {};
      Object.keys(tasks).forEach((key) => {
        var task = tasks[key];
        if (!Array.isArray(task)) {
          enqueueTask(key, [task]);
          readyToCheck.push(key);
          return;
        }
        var dependencies = task.slice(0, task.length - 1);
        var remainingDependencies = dependencies.length;
        if (remainingDependencies === 0) {
          enqueueTask(key, task);
          readyToCheck.push(key);
          return;
        }
        uncheckedDependencies[key] = remainingDependencies;
        dependencies.forEach((dependencyName) => {
          if (!tasks[dependencyName]) {
            throw new Error("async.auto task `" + key + "` has a non-existent dependency `" + dependencyName + "` in " + dependencies.join(", "));
          }
          addListener(dependencyName, () => {
            remainingDependencies--;
            if (remainingDependencies === 0) {
              enqueueTask(key, task);
            }
          });
        });
      });
      checkForDeadlocks();
      processQueue();
      function enqueueTask(key, task) {
        readyTasks.push(() => runTask(key, task));
      }
      function processQueue() {
        if (canceled)
          return;
        if (readyTasks.length === 0 && runningTasks === 0) {
          return callback(null, results);
        }
        while (readyTasks.length && runningTasks < concurrency) {
          var run = readyTasks.shift();
          run();
        }
      }
      function addListener(taskName, fn) {
        var taskListeners = listeners[taskName];
        if (!taskListeners) {
          taskListeners = listeners[taskName] = [];
        }
        taskListeners.push(fn);
      }
      function taskComplete(taskName) {
        var taskListeners = listeners[taskName] || [];
        taskListeners.forEach((fn) => fn());
        processQueue();
      }
      function runTask(key, task) {
        if (hasError)
          return;
        var taskCallback = onlyOnce((err, ...result) => {
          runningTasks--;
          if (err === false) {
            canceled = true;
            return;
          }
          if (result.length < 2) {
            [result] = result;
          }
          if (err) {
            var safeResults = {};
            Object.keys(results).forEach((rkey) => {
              safeResults[rkey] = results[rkey];
            });
            safeResults[key] = result;
            hasError = true;
            listeners = Object.create(null);
            if (canceled)
              return;
            callback(err, safeResults);
          } else {
            results[key] = result;
            taskComplete(key);
          }
        });
        runningTasks++;
        var taskFn = wrapAsync(task[task.length - 1]);
        if (task.length > 1) {
          taskFn(results, taskCallback);
        } else {
          taskFn(taskCallback);
        }
      }
      function checkForDeadlocks() {
        var currentTask;
        var counter = 0;
        while (readyToCheck.length) {
          currentTask = readyToCheck.pop();
          counter++;
          getDependents(currentTask).forEach((dependent) => {
            if (--uncheckedDependencies[dependent] === 0) {
              readyToCheck.push(dependent);
            }
          });
        }
        if (counter !== numTasks) {
          throw new Error("async.auto cannot execute tasks due to a recursive dependency");
        }
      }
      function getDependents(taskName) {
        var result = [];
        Object.keys(tasks).forEach((key) => {
          const task = tasks[key];
          if (Array.isArray(task) && task.indexOf(taskName) >= 0) {
            result.push(key);
          }
        });
        return result;
      }
      return callback[PROMISE_SYMBOL];
    }
    var FN_ARGS = /^(?:async\s)?(?:function)?\s*(?:\w+\s*)?\(([^)]+)\)(?:\s*{)/;
    var ARROW_FN_ARGS = /^(?:async\s)?\s*(?:\(\s*)?((?:[^)=\s]\s*)*)(?:\)\s*)?=>/;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /(=.+)?(\s*)$/;
    function stripComments(string) {
      let stripped = "";
      let index2 = 0;
      let endBlockComment = string.indexOf("*/");
      while (index2 < string.length) {
        if (string[index2] === "/" && string[index2 + 1] === "/") {
          let endIndex = string.indexOf(`
`, index2);
          index2 = endIndex === -1 ? string.length : endIndex;
        } else if (endBlockComment !== -1 && string[index2] === "/" && string[index2 + 1] === "*") {
          let endIndex = string.indexOf("*/", index2);
          if (endIndex !== -1) {
            index2 = endIndex + 2;
            endBlockComment = string.indexOf("*/", index2);
          } else {
            stripped += string[index2];
            index2++;
          }
        } else {
          stripped += string[index2];
          index2++;
        }
      }
      return stripped;
    }
    function parseParams(func) {
      const src = stripComments(func.toString());
      let match = src.match(FN_ARGS);
      if (!match) {
        match = src.match(ARROW_FN_ARGS);
      }
      if (!match)
        throw new Error(`could not parse args in autoInject
Source:
` + src);
      let [, args] = match;
      return args.replace(/\s/g, "").split(FN_ARG_SPLIT).map((arg) => arg.replace(FN_ARG, "").trim());
    }
    function autoInject(tasks, callback) {
      var newTasks = {};
      Object.keys(tasks).forEach((key) => {
        var taskFn = tasks[key];
        var params;
        var fnIsAsync = isAsync(taskFn);
        var hasNoDeps = !fnIsAsync && taskFn.length === 1 || fnIsAsync && taskFn.length === 0;
        if (Array.isArray(taskFn)) {
          params = [...taskFn];
          taskFn = params.pop();
          newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
        } else if (hasNoDeps) {
          newTasks[key] = taskFn;
        } else {
          params = parseParams(taskFn);
          if (taskFn.length === 0 && !fnIsAsync && params.length === 0) {
            throw new Error("autoInject task functions require explicit parameters.");
          }
          if (!fnIsAsync)
            params.pop();
          newTasks[key] = params.concat(newTask);
        }
        function newTask(results, taskCb) {
          var newArgs = params.map((name) => results[name]);
          newArgs.push(taskCb);
          wrapAsync(taskFn)(...newArgs);
        }
      });
      return auto(newTasks, callback);
    }

    class DLL {
      constructor() {
        this.head = this.tail = null;
        this.length = 0;
      }
      removeLink(node) {
        if (node.prev)
          node.prev.next = node.next;
        else
          this.head = node.next;
        if (node.next)
          node.next.prev = node.prev;
        else
          this.tail = node.prev;
        node.prev = node.next = null;
        this.length -= 1;
        return node;
      }
      empty() {
        while (this.head)
          this.shift();
        return this;
      }
      insertAfter(node, newNode) {
        newNode.prev = node;
        newNode.next = node.next;
        if (node.next)
          node.next.prev = newNode;
        else
          this.tail = newNode;
        node.next = newNode;
        this.length += 1;
      }
      insertBefore(node, newNode) {
        newNode.prev = node.prev;
        newNode.next = node;
        if (node.prev)
          node.prev.next = newNode;
        else
          this.head = newNode;
        node.prev = newNode;
        this.length += 1;
      }
      unshift(node) {
        if (this.head)
          this.insertBefore(this.head, node);
        else
          setInitial(this, node);
      }
      push(node) {
        if (this.tail)
          this.insertAfter(this.tail, node);
        else
          setInitial(this, node);
      }
      shift() {
        return this.head && this.removeLink(this.head);
      }
      pop() {
        return this.tail && this.removeLink(this.tail);
      }
      toArray() {
        return [...this];
      }
      *[Symbol.iterator]() {
        var cur = this.head;
        while (cur) {
          yield cur.data;
          cur = cur.next;
        }
      }
      remove(testFn) {
        var curr = this.head;
        while (curr) {
          var { next } = curr;
          if (testFn(curr)) {
            this.removeLink(curr);
          }
          curr = next;
        }
        return this;
      }
    }
    function setInitial(dll, node) {
      dll.length = 1;
      dll.head = dll.tail = node;
    }
    function queue$1(worker, concurrency, payload) {
      if (concurrency == null) {
        concurrency = 1;
      } else if (concurrency === 0) {
        throw new RangeError("Concurrency must not be zero");
      }
      var _worker = wrapAsync(worker);
      var numRunning = 0;
      var workersList = [];
      const events = {
        error: [],
        drain: [],
        saturated: [],
        unsaturated: [],
        empty: []
      };
      function on(event, handler) {
        events[event].push(handler);
      }
      function once2(event, handler) {
        const handleAndRemove = (...args) => {
          off(event, handleAndRemove);
          handler(...args);
        };
        events[event].push(handleAndRemove);
      }
      function off(event, handler) {
        if (!event)
          return Object.keys(events).forEach((ev) => events[ev] = []);
        if (!handler)
          return events[event] = [];
        events[event] = events[event].filter((ev) => ev !== handler);
      }
      function trigger(event, ...args) {
        events[event].forEach((handler) => handler(...args));
      }
      var processingScheduled = false;
      function _insert(data, insertAtFront, rejectOnError, callback) {
        if (callback != null && typeof callback !== "function") {
          throw new Error("task callback must be a function");
        }
        q.started = true;
        var res, rej;
        function promiseCallback2(err, ...args) {
          if (err)
            return rejectOnError ? rej(err) : res();
          if (args.length <= 1)
            return res(args[0]);
          res(args);
        }
        var item = q._createTaskItem(data, rejectOnError ? promiseCallback2 : callback || promiseCallback2);
        if (insertAtFront) {
          q._tasks.unshift(item);
        } else {
          q._tasks.push(item);
        }
        if (!processingScheduled) {
          processingScheduled = true;
          setImmediate$1(() => {
            processingScheduled = false;
            q.process();
          });
        }
        if (rejectOnError || !callback) {
          return new Promise((resolve, reject2) => {
            res = resolve;
            rej = reject2;
          });
        }
      }
      function _createCB(tasks) {
        return function(err, ...args) {
          numRunning -= 1;
          for (var i = 0, l = tasks.length;i < l; i++) {
            var task = tasks[i];
            var index2 = workersList.indexOf(task);
            if (index2 === 0) {
              workersList.shift();
            } else if (index2 > 0) {
              workersList.splice(index2, 1);
            }
            task.callback(err, ...args);
            if (err != null) {
              trigger("error", err, task.data);
            }
          }
          if (numRunning <= q.concurrency - q.buffer) {
            trigger("unsaturated");
          }
          if (q.idle()) {
            trigger("drain");
          }
          q.process();
        };
      }
      function _maybeDrain(data) {
        if (data.length === 0 && q.idle()) {
          setImmediate$1(() => trigger("drain"));
          return true;
        }
        return false;
      }
      const eventMethod = (name) => (handler) => {
        if (!handler) {
          return new Promise((resolve, reject2) => {
            once2(name, (err, data) => {
              if (err)
                return reject2(err);
              resolve(data);
            });
          });
        }
        off(name);
        on(name, handler);
      };
      var isProcessing = false;
      var q = {
        _tasks: new DLL,
        _createTaskItem(data, callback) {
          return {
            data,
            callback
          };
        },
        *[Symbol.iterator]() {
          yield* q._tasks[Symbol.iterator]();
        },
        concurrency,
        payload,
        buffer: concurrency / 4,
        started: false,
        paused: false,
        push(data, callback) {
          if (Array.isArray(data)) {
            if (_maybeDrain(data))
              return;
            return data.map((datum) => _insert(datum, false, false, callback));
          }
          return _insert(data, false, false, callback);
        },
        pushAsync(data, callback) {
          if (Array.isArray(data)) {
            if (_maybeDrain(data))
              return;
            return data.map((datum) => _insert(datum, false, true, callback));
          }
          return _insert(data, false, true, callback);
        },
        kill() {
          off();
          q._tasks.empty();
        },
        unshift(data, callback) {
          if (Array.isArray(data)) {
            if (_maybeDrain(data))
              return;
            return data.map((datum) => _insert(datum, true, false, callback));
          }
          return _insert(data, true, false, callback);
        },
        unshiftAsync(data, callback) {
          if (Array.isArray(data)) {
            if (_maybeDrain(data))
              return;
            return data.map((datum) => _insert(datum, true, true, callback));
          }
          return _insert(data, true, true, callback);
        },
        remove(testFn) {
          q._tasks.remove(testFn);
        },
        process() {
          if (isProcessing) {
            return;
          }
          isProcessing = true;
          while (!q.paused && numRunning < q.concurrency && q._tasks.length) {
            var tasks = [], data = [];
            var l = q._tasks.length;
            if (q.payload)
              l = Math.min(l, q.payload);
            for (var i = 0;i < l; i++) {
              var node = q._tasks.shift();
              tasks.push(node);
              workersList.push(node);
              data.push(node.data);
            }
            numRunning += 1;
            if (q._tasks.length === 0) {
              trigger("empty");
            }
            if (numRunning === q.concurrency) {
              trigger("saturated");
            }
            var cb = onlyOnce(_createCB(tasks));
            _worker(data, cb);
          }
          isProcessing = false;
        },
        length() {
          return q._tasks.length;
        },
        running() {
          return numRunning;
        },
        workersList() {
          return workersList;
        },
        idle() {
          return q._tasks.length + numRunning === 0;
        },
        pause() {
          q.paused = true;
        },
        resume() {
          if (q.paused === false) {
            return;
          }
          q.paused = false;
          setImmediate$1(q.process);
        }
      };
      Object.defineProperties(q, {
        saturated: {
          writable: false,
          value: eventMethod("saturated")
        },
        unsaturated: {
          writable: false,
          value: eventMethod("unsaturated")
        },
        empty: {
          writable: false,
          value: eventMethod("empty")
        },
        drain: {
          writable: false,
          value: eventMethod("drain")
        },
        error: {
          writable: false,
          value: eventMethod("error")
        }
      });
      return q;
    }
    function cargo$1(worker, payload) {
      return queue$1(worker, 1, payload);
    }
    function cargo(worker, concurrency, payload) {
      return queue$1(worker, concurrency, payload);
    }
    function reduce(coll, memo, iteratee, callback) {
      callback = once(callback);
      var _iteratee = wrapAsync(iteratee);
      return eachOfSeries$1(coll, (x, i, iterCb) => {
        _iteratee(memo, x, (err, v) => {
          memo = v;
          iterCb(err);
        });
      }, (err) => callback(err, memo));
    }
    var reduce$1 = awaitify(reduce, 4);
    function seq(...functions) {
      var _functions = functions.map(wrapAsync);
      return function(...args) {
        var that = this;
        var cb = args[args.length - 1];
        if (typeof cb == "function") {
          args.pop();
        } else {
          cb = promiseCallback();
        }
        reduce$1(_functions, args, (newargs, fn, iterCb) => {
          fn.apply(that, newargs.concat((err, ...nextargs) => {
            iterCb(err, nextargs);
          }));
        }, (err, results) => cb(err, ...results));
        return cb[PROMISE_SYMBOL];
      };
    }
    function compose(...args) {
      return seq(...args.reverse());
    }
    function mapLimit(coll, limit, iteratee, callback) {
      return _asyncMap(eachOfLimit$2(limit), coll, iteratee, callback);
    }
    var mapLimit$1 = awaitify(mapLimit, 4);
    function concatLimit(coll, limit, iteratee, callback) {
      var _iteratee = wrapAsync(iteratee);
      return mapLimit$1(coll, limit, (val, iterCb) => {
        _iteratee(val, (err, ...args) => {
          if (err)
            return iterCb(err);
          return iterCb(err, args);
        });
      }, (err, mapResults) => {
        var result = [];
        for (var i = 0;i < mapResults.length; i++) {
          if (mapResults[i]) {
            result = result.concat(...mapResults[i]);
          }
        }
        return callback(err, result);
      });
    }
    var concatLimit$1 = awaitify(concatLimit, 4);
    function concat(coll, iteratee, callback) {
      return concatLimit$1(coll, Infinity, iteratee, callback);
    }
    var concat$1 = awaitify(concat, 3);
    function concatSeries(coll, iteratee, callback) {
      return concatLimit$1(coll, 1, iteratee, callback);
    }
    var concatSeries$1 = awaitify(concatSeries, 3);
    function constant$1(...args) {
      return function(...ignoredArgs) {
        var callback = ignoredArgs.pop();
        return callback(null, ...args);
      };
    }
    function _createTester(check, getResult) {
      return (eachfn, arr, _iteratee, cb) => {
        var testPassed = false;
        var testResult;
        const iteratee = wrapAsync(_iteratee);
        eachfn(arr, (value, _2, callback) => {
          iteratee(value, (err, result) => {
            if (err || err === false)
              return callback(err);
            if (check(result) && !testResult) {
              testPassed = true;
              testResult = getResult(true, value);
              return callback(null, breakLoop);
            }
            callback();
          });
        }, (err) => {
          if (err)
            return cb(err);
          cb(null, testPassed ? testResult : getResult(false));
        });
      };
    }
    function detect(coll, iteratee, callback) {
      return _createTester((bool) => bool, (res, item) => item)(eachOf$1, coll, iteratee, callback);
    }
    var detect$1 = awaitify(detect, 3);
    function detectLimit(coll, limit, iteratee, callback) {
      return _createTester((bool) => bool, (res, item) => item)(eachOfLimit$2(limit), coll, iteratee, callback);
    }
    var detectLimit$1 = awaitify(detectLimit, 4);
    function detectSeries(coll, iteratee, callback) {
      return _createTester((bool) => bool, (res, item) => item)(eachOfLimit$2(1), coll, iteratee, callback);
    }
    var detectSeries$1 = awaitify(detectSeries, 3);
    function consoleFunc(name) {
      return (fn, ...args) => wrapAsync(fn)(...args, (err, ...resultArgs) => {
        if (typeof console === "object") {
          if (err) {
            if (console.error) {
              console.error(err);
            }
          } else if (console[name]) {
            resultArgs.forEach((x) => console[name](x));
          }
        }
      });
    }
    var dir = consoleFunc("dir");
    function doWhilst(iteratee, test, callback) {
      callback = onlyOnce(callback);
      var _fn = wrapAsync(iteratee);
      var _test = wrapAsync(test);
      var results;
      function next(err, ...args) {
        if (err)
          return callback(err);
        if (err === false)
          return;
        results = args;
        _test(...args, check);
      }
      function check(err, truth) {
        if (err)
          return callback(err);
        if (err === false)
          return;
        if (!truth)
          return callback(null, ...results);
        _fn(next);
      }
      return check(null, true);
    }
    var doWhilst$1 = awaitify(doWhilst, 3);
    function doUntil(iteratee, test, callback) {
      const _test = wrapAsync(test);
      return doWhilst$1(iteratee, (...args) => {
        const cb = args.pop();
        _test(...args, (err, truth) => cb(err, !truth));
      }, callback);
    }
    function _withoutIndex(iteratee) {
      return (value, index2, callback) => iteratee(value, callback);
    }
    function eachLimit$2(coll, iteratee, callback) {
      return eachOf$1(coll, _withoutIndex(wrapAsync(iteratee)), callback);
    }
    var each = awaitify(eachLimit$2, 3);
    function eachLimit(coll, limit, iteratee, callback) {
      return eachOfLimit$2(limit)(coll, _withoutIndex(wrapAsync(iteratee)), callback);
    }
    var eachLimit$1 = awaitify(eachLimit, 4);
    function eachSeries(coll, iteratee, callback) {
      return eachLimit$1(coll, 1, iteratee, callback);
    }
    var eachSeries$1 = awaitify(eachSeries, 3);
    function ensureAsync(fn) {
      if (isAsync(fn))
        return fn;
      return function(...args) {
        var callback = args.pop();
        var sync = true;
        args.push((...innerArgs) => {
          if (sync) {
            setImmediate$1(() => callback(...innerArgs));
          } else {
            callback(...innerArgs);
          }
        });
        fn.apply(this, args);
        sync = false;
      };
    }
    function every(coll, iteratee, callback) {
      return _createTester((bool) => !bool, (res) => !res)(eachOf$1, coll, iteratee, callback);
    }
    var every$1 = awaitify(every, 3);
    function everyLimit(coll, limit, iteratee, callback) {
      return _createTester((bool) => !bool, (res) => !res)(eachOfLimit$2(limit), coll, iteratee, callback);
    }
    var everyLimit$1 = awaitify(everyLimit, 4);
    function everySeries(coll, iteratee, callback) {
      return _createTester((bool) => !bool, (res) => !res)(eachOfSeries$1, coll, iteratee, callback);
    }
    var everySeries$1 = awaitify(everySeries, 3);
    function filterArray(eachfn, arr, iteratee, callback) {
      var truthValues = new Array(arr.length);
      eachfn(arr, (x, index2, iterCb) => {
        iteratee(x, (err, v) => {
          truthValues[index2] = !!v;
          iterCb(err);
        });
      }, (err) => {
        if (err)
          return callback(err);
        var results = [];
        for (var i = 0;i < arr.length; i++) {
          if (truthValues[i])
            results.push(arr[i]);
        }
        callback(null, results);
      });
    }
    function filterGeneric(eachfn, coll, iteratee, callback) {
      var results = [];
      eachfn(coll, (x, index2, iterCb) => {
        iteratee(x, (err, v) => {
          if (err)
            return iterCb(err);
          if (v) {
            results.push({ index: index2, value: x });
          }
          iterCb(err);
        });
      }, (err) => {
        if (err)
          return callback(err);
        callback(null, results.sort((a, b) => a.index - b.index).map((v) => v.value));
      });
    }
    function _filter(eachfn, coll, iteratee, callback) {
      var filter2 = isArrayLike(coll) ? filterArray : filterGeneric;
      return filter2(eachfn, coll, wrapAsync(iteratee), callback);
    }
    function filter(coll, iteratee, callback) {
      return _filter(eachOf$1, coll, iteratee, callback);
    }
    var filter$1 = awaitify(filter, 3);
    function filterLimit(coll, limit, iteratee, callback) {
      return _filter(eachOfLimit$2(limit), coll, iteratee, callback);
    }
    var filterLimit$1 = awaitify(filterLimit, 4);
    function filterSeries(coll, iteratee, callback) {
      return _filter(eachOfSeries$1, coll, iteratee, callback);
    }
    var filterSeries$1 = awaitify(filterSeries, 3);
    function forever(fn, errback) {
      var done = onlyOnce(errback);
      var task = wrapAsync(ensureAsync(fn));
      function next(err) {
        if (err)
          return done(err);
        if (err === false)
          return;
        task(next);
      }
      return next();
    }
    var forever$1 = awaitify(forever, 2);
    function groupByLimit(coll, limit, iteratee, callback) {
      var _iteratee = wrapAsync(iteratee);
      return mapLimit$1(coll, limit, (val, iterCb) => {
        _iteratee(val, (err, key) => {
          if (err)
            return iterCb(err);
          return iterCb(err, { key, val });
        });
      }, (err, mapResults) => {
        var result = {};
        var { hasOwnProperty } = Object.prototype;
        for (var i = 0;i < mapResults.length; i++) {
          if (mapResults[i]) {
            var { key } = mapResults[i];
            var { val } = mapResults[i];
            if (hasOwnProperty.call(result, key)) {
              result[key].push(val);
            } else {
              result[key] = [val];
            }
          }
        }
        return callback(err, result);
      });
    }
    var groupByLimit$1 = awaitify(groupByLimit, 4);
    function groupBy(coll, iteratee, callback) {
      return groupByLimit$1(coll, Infinity, iteratee, callback);
    }
    function groupBySeries(coll, iteratee, callback) {
      return groupByLimit$1(coll, 1, iteratee, callback);
    }
    var log = consoleFunc("log");
    function mapValuesLimit(obj, limit, iteratee, callback) {
      callback = once(callback);
      var newObj = {};
      var _iteratee = wrapAsync(iteratee);
      return eachOfLimit$2(limit)(obj, (val, key, next) => {
        _iteratee(val, key, (err, result) => {
          if (err)
            return next(err);
          newObj[key] = result;
          next(err);
        });
      }, (err) => callback(err, newObj));
    }
    var mapValuesLimit$1 = awaitify(mapValuesLimit, 4);
    function mapValues(obj, iteratee, callback) {
      return mapValuesLimit$1(obj, Infinity, iteratee, callback);
    }
    function mapValuesSeries(obj, iteratee, callback) {
      return mapValuesLimit$1(obj, 1, iteratee, callback);
    }
    function memoize(fn, hasher = (v) => v) {
      var memo = Object.create(null);
      var queues = Object.create(null);
      var _fn = wrapAsync(fn);
      var memoized = initialParams((args, callback) => {
        var key = hasher(...args);
        if (key in memo) {
          setImmediate$1(() => callback(null, ...memo[key]));
        } else if (key in queues) {
          queues[key].push(callback);
        } else {
          queues[key] = [callback];
          _fn(...args, (err, ...resultArgs) => {
            if (!err) {
              memo[key] = resultArgs;
            }
            var q = queues[key];
            delete queues[key];
            for (var i = 0, l = q.length;i < l; i++) {
              q[i](err, ...resultArgs);
            }
          });
        }
      });
      memoized.memo = memo;
      memoized.unmemoized = fn;
      return memoized;
    }
    var _defer;
    if (hasNextTick) {
      _defer = process.nextTick;
    } else if (hasSetImmediate) {
      _defer = setImmediate;
    } else {
      _defer = fallback;
    }
    var nextTick = wrap(_defer);
    var _parallel = awaitify((eachfn, tasks, callback) => {
      var results = isArrayLike(tasks) ? [] : {};
      eachfn(tasks, (task, key, taskCb) => {
        wrapAsync(task)((err, ...result) => {
          if (result.length < 2) {
            [result] = result;
          }
          results[key] = result;
          taskCb(err);
        });
      }, (err) => callback(err, results));
    }, 3);
    function parallel(tasks, callback) {
      return _parallel(eachOf$1, tasks, callback);
    }
    function parallelLimit(tasks, limit, callback) {
      return _parallel(eachOfLimit$2(limit), tasks, callback);
    }
    function queue(worker, concurrency) {
      var _worker = wrapAsync(worker);
      return queue$1((items, cb) => {
        _worker(items[0], cb);
      }, concurrency, 1);
    }

    class Heap {
      constructor() {
        this.heap = [];
        this.pushCount = Number.MIN_SAFE_INTEGER;
      }
      get length() {
        return this.heap.length;
      }
      empty() {
        this.heap = [];
        return this;
      }
      percUp(index2) {
        let p;
        while (index2 > 0 && smaller(this.heap[index2], this.heap[p = parent(index2)])) {
          let t = this.heap[index2];
          this.heap[index2] = this.heap[p];
          this.heap[p] = t;
          index2 = p;
        }
      }
      percDown(index2) {
        let l;
        while ((l = leftChi(index2)) < this.heap.length) {
          if (l + 1 < this.heap.length && smaller(this.heap[l + 1], this.heap[l])) {
            l = l + 1;
          }
          if (smaller(this.heap[index2], this.heap[l])) {
            break;
          }
          let t = this.heap[index2];
          this.heap[index2] = this.heap[l];
          this.heap[l] = t;
          index2 = l;
        }
      }
      push(node) {
        node.pushCount = ++this.pushCount;
        this.heap.push(node);
        this.percUp(this.heap.length - 1);
      }
      unshift(node) {
        return this.heap.push(node);
      }
      shift() {
        let [top] = this.heap;
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.pop();
        this.percDown(0);
        return top;
      }
      toArray() {
        return [...this];
      }
      *[Symbol.iterator]() {
        for (let i = 0;i < this.heap.length; i++) {
          yield this.heap[i].data;
        }
      }
      remove(testFn) {
        let j = 0;
        for (let i = 0;i < this.heap.length; i++) {
          if (!testFn(this.heap[i])) {
            this.heap[j] = this.heap[i];
            j++;
          }
        }
        this.heap.splice(j);
        for (let i = parent(this.heap.length - 1);i >= 0; i--) {
          this.percDown(i);
        }
        return this;
      }
    }
    function leftChi(i) {
      return (i << 1) + 1;
    }
    function parent(i) {
      return (i + 1 >> 1) - 1;
    }
    function smaller(x, y) {
      if (x.priority !== y.priority) {
        return x.priority < y.priority;
      } else {
        return x.pushCount < y.pushCount;
      }
    }
    function priorityQueue(worker, concurrency) {
      var q = queue(worker, concurrency);
      var {
        push,
        pushAsync
      } = q;
      q._tasks = new Heap;
      q._createTaskItem = ({ data, priority }, callback) => {
        return {
          data,
          priority,
          callback
        };
      };
      function createDataItems(tasks, priority) {
        if (!Array.isArray(tasks)) {
          return { data: tasks, priority };
        }
        return tasks.map((data) => {
          return { data, priority };
        });
      }
      q.push = function(data, priority = 0, callback) {
        return push(createDataItems(data, priority), callback);
      };
      q.pushAsync = function(data, priority = 0, callback) {
        return pushAsync(createDataItems(data, priority), callback);
      };
      delete q.unshift;
      delete q.unshiftAsync;
      return q;
    }
    function race(tasks, callback) {
      callback = once(callback);
      if (!Array.isArray(tasks))
        return callback(new TypeError("First argument to race must be an array of functions"));
      if (!tasks.length)
        return callback();
      for (var i = 0, l = tasks.length;i < l; i++) {
        wrapAsync(tasks[i])(callback);
      }
    }
    var race$1 = awaitify(race, 2);
    function reduceRight(array, memo, iteratee, callback) {
      var reversed = [...array].reverse();
      return reduce$1(reversed, memo, iteratee, callback);
    }
    function reflect(fn) {
      var _fn = wrapAsync(fn);
      return initialParams(function reflectOn(args, reflectCallback) {
        args.push((error, ...cbArgs) => {
          let retVal = {};
          if (error) {
            retVal.error = error;
          }
          if (cbArgs.length > 0) {
            var value = cbArgs;
            if (cbArgs.length <= 1) {
              [value] = cbArgs;
            }
            retVal.value = value;
          }
          reflectCallback(null, retVal);
        });
        return _fn.apply(this, args);
      });
    }
    function reflectAll(tasks) {
      var results;
      if (Array.isArray(tasks)) {
        results = tasks.map(reflect);
      } else {
        results = {};
        Object.keys(tasks).forEach((key) => {
          results[key] = reflect.call(this, tasks[key]);
        });
      }
      return results;
    }
    function reject$2(eachfn, arr, _iteratee, callback) {
      const iteratee = wrapAsync(_iteratee);
      return _filter(eachfn, arr, (value, cb) => {
        iteratee(value, (err, v) => {
          cb(err, !v);
        });
      }, callback);
    }
    function reject(coll, iteratee, callback) {
      return reject$2(eachOf$1, coll, iteratee, callback);
    }
    var reject$1 = awaitify(reject, 3);
    function rejectLimit(coll, limit, iteratee, callback) {
      return reject$2(eachOfLimit$2(limit), coll, iteratee, callback);
    }
    var rejectLimit$1 = awaitify(rejectLimit, 4);
    function rejectSeries(coll, iteratee, callback) {
      return reject$2(eachOfSeries$1, coll, iteratee, callback);
    }
    var rejectSeries$1 = awaitify(rejectSeries, 3);
    function constant(value) {
      return function() {
        return value;
      };
    }
    const DEFAULT_TIMES = 5;
    const DEFAULT_INTERVAL = 0;
    function retry(opts, task, callback) {
      var options = {
        times: DEFAULT_TIMES,
        intervalFunc: constant(DEFAULT_INTERVAL)
      };
      if (arguments.length < 3 && typeof opts === "function") {
        callback = task || promiseCallback();
        task = opts;
      } else {
        parseTimes(options, opts);
        callback = callback || promiseCallback();
      }
      if (typeof task !== "function") {
        throw new Error("Invalid arguments for async.retry");
      }
      var _task = wrapAsync(task);
      var attempt = 1;
      function retryAttempt() {
        _task((err, ...args) => {
          if (err === false)
            return;
          if (err && attempt++ < options.times && (typeof options.errorFilter != "function" || options.errorFilter(err))) {
            setTimeout(retryAttempt, options.intervalFunc(attempt - 1));
          } else {
            callback(err, ...args);
          }
        });
      }
      retryAttempt();
      return callback[PROMISE_SYMBOL];
    }
    function parseTimes(acc, t) {
      if (typeof t === "object") {
        acc.times = +t.times || DEFAULT_TIMES;
        acc.intervalFunc = typeof t.interval === "function" ? t.interval : constant(+t.interval || DEFAULT_INTERVAL);
        acc.errorFilter = t.errorFilter;
      } else if (typeof t === "number" || typeof t === "string") {
        acc.times = +t || DEFAULT_TIMES;
      } else {
        throw new Error("Invalid arguments for async.retry");
      }
    }
    function retryable(opts, task) {
      if (!task) {
        task = opts;
        opts = null;
      }
      let arity = opts && opts.arity || task.length;
      if (isAsync(task)) {
        arity += 1;
      }
      var _task = wrapAsync(task);
      return initialParams((args, callback) => {
        if (args.length < arity - 1 || callback == null) {
          args.push(callback);
          callback = promiseCallback();
        }
        function taskFn(cb) {
          _task(...args, cb);
        }
        if (opts)
          retry(opts, taskFn, callback);
        else
          retry(taskFn, callback);
        return callback[PROMISE_SYMBOL];
      });
    }
    function series(tasks, callback) {
      return _parallel(eachOfSeries$1, tasks, callback);
    }
    function some(coll, iteratee, callback) {
      return _createTester(Boolean, (res) => res)(eachOf$1, coll, iteratee, callback);
    }
    var some$1 = awaitify(some, 3);
    function someLimit(coll, limit, iteratee, callback) {
      return _createTester(Boolean, (res) => res)(eachOfLimit$2(limit), coll, iteratee, callback);
    }
    var someLimit$1 = awaitify(someLimit, 4);
    function someSeries(coll, iteratee, callback) {
      return _createTester(Boolean, (res) => res)(eachOfSeries$1, coll, iteratee, callback);
    }
    var someSeries$1 = awaitify(someSeries, 3);
    function sortBy(coll, iteratee, callback) {
      var _iteratee = wrapAsync(iteratee);
      return map$1(coll, (x, iterCb) => {
        _iteratee(x, (err, criteria) => {
          if (err)
            return iterCb(err);
          iterCb(err, { value: x, criteria });
        });
      }, (err, results) => {
        if (err)
          return callback(err);
        callback(null, results.sort(comparator).map((v) => v.value));
      });
      function comparator(left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
      }
    }
    var sortBy$1 = awaitify(sortBy, 3);
    function timeout(asyncFn, milliseconds, info) {
      var fn = wrapAsync(asyncFn);
      return initialParams((args, callback) => {
        var timedOut = false;
        var timer;
        function timeoutCallback() {
          var name = asyncFn.name || "anonymous";
          var error = new Error('Callback function "' + name + '" timed out.');
          error.code = "ETIMEDOUT";
          if (info) {
            error.info = info;
          }
          timedOut = true;
          callback(error);
        }
        args.push((...cbArgs) => {
          if (!timedOut) {
            callback(...cbArgs);
            clearTimeout(timer);
          }
        });
        timer = setTimeout(timeoutCallback, milliseconds);
        fn(...args);
      });
    }
    function range(size) {
      var result = Array(size);
      while (size--) {
        result[size] = size;
      }
      return result;
    }
    function timesLimit(count, limit, iteratee, callback) {
      var _iteratee = wrapAsync(iteratee);
      return mapLimit$1(range(count), limit, _iteratee, callback);
    }
    function times(n, iteratee, callback) {
      return timesLimit(n, Infinity, iteratee, callback);
    }
    function timesSeries(n, iteratee, callback) {
      return timesLimit(n, 1, iteratee, callback);
    }
    function transform(coll, accumulator, iteratee, callback) {
      if (arguments.length <= 3 && typeof accumulator === "function") {
        callback = iteratee;
        iteratee = accumulator;
        accumulator = Array.isArray(coll) ? [] : {};
      }
      callback = once(callback || promiseCallback());
      var _iteratee = wrapAsync(iteratee);
      eachOf$1(coll, (v, k, cb) => {
        _iteratee(accumulator, v, k, cb);
      }, (err) => callback(err, accumulator));
      return callback[PROMISE_SYMBOL];
    }
    function tryEach(tasks, callback) {
      var error = null;
      var result;
      return eachSeries$1(tasks, (task, taskCb) => {
        wrapAsync(task)((err, ...args) => {
          if (err === false)
            return taskCb(err);
          if (args.length < 2) {
            [result] = args;
          } else {
            result = args;
          }
          error = err;
          taskCb(err ? null : {});
        });
      }, () => callback(error, result));
    }
    var tryEach$1 = awaitify(tryEach);
    function unmemoize(fn) {
      return (...args) => {
        return (fn.unmemoized || fn)(...args);
      };
    }
    function whilst(test, iteratee, callback) {
      callback = onlyOnce(callback);
      var _fn = wrapAsync(iteratee);
      var _test = wrapAsync(test);
      var results = [];
      function next(err, ...rest) {
        if (err)
          return callback(err);
        results = rest;
        if (err === false)
          return;
        _test(check);
      }
      function check(err, truth) {
        if (err)
          return callback(err);
        if (err === false)
          return;
        if (!truth)
          return callback(null, ...results);
        _fn(next);
      }
      return _test(check);
    }
    var whilst$1 = awaitify(whilst, 3);
    function until(test, iteratee, callback) {
      const _test = wrapAsync(test);
      return whilst$1((cb) => _test((err, truth) => cb(err, !truth)), iteratee, callback);
    }
    function waterfall(tasks, callback) {
      callback = once(callback);
      if (!Array.isArray(tasks))
        return callback(new Error("First argument to waterfall must be an array of functions"));
      if (!tasks.length)
        return callback();
      var taskIndex = 0;
      function nextTask(args) {
        var task = wrapAsync(tasks[taskIndex++]);
        task(...args, onlyOnce(next));
      }
      function next(err, ...args) {
        if (err === false)
          return;
        if (err || taskIndex === tasks.length) {
          return callback(err, ...args);
        }
        nextTask(args);
      }
      nextTask([]);
    }
    var waterfall$1 = awaitify(waterfall);
    var index = {
      apply,
      applyEach,
      applyEachSeries,
      asyncify,
      auto,
      autoInject,
      cargo: cargo$1,
      cargoQueue: cargo,
      compose,
      concat: concat$1,
      concatLimit: concatLimit$1,
      concatSeries: concatSeries$1,
      constant: constant$1,
      detect: detect$1,
      detectLimit: detectLimit$1,
      detectSeries: detectSeries$1,
      dir,
      doUntil,
      doWhilst: doWhilst$1,
      each,
      eachLimit: eachLimit$1,
      eachOf: eachOf$1,
      eachOfLimit: eachOfLimit$1,
      eachOfSeries: eachOfSeries$1,
      eachSeries: eachSeries$1,
      ensureAsync,
      every: every$1,
      everyLimit: everyLimit$1,
      everySeries: everySeries$1,
      filter: filter$1,
      filterLimit: filterLimit$1,
      filterSeries: filterSeries$1,
      forever: forever$1,
      groupBy,
      groupByLimit: groupByLimit$1,
      groupBySeries,
      log,
      map: map$1,
      mapLimit: mapLimit$1,
      mapSeries: mapSeries$1,
      mapValues,
      mapValuesLimit: mapValuesLimit$1,
      mapValuesSeries,
      memoize,
      nextTick,
      parallel,
      parallelLimit,
      priorityQueue,
      queue,
      race: race$1,
      reduce: reduce$1,
      reduceRight,
      reflect,
      reflectAll,
      reject: reject$1,
      rejectLimit: rejectLimit$1,
      rejectSeries: rejectSeries$1,
      retry,
      retryable,
      seq,
      series,
      setImmediate: setImmediate$1,
      some: some$1,
      someLimit: someLimit$1,
      someSeries: someSeries$1,
      sortBy: sortBy$1,
      timeout,
      times,
      timesLimit,
      timesSeries,
      transform,
      tryEach: tryEach$1,
      unmemoize,
      until,
      waterfall: waterfall$1,
      whilst: whilst$1,
      all: every$1,
      allLimit: everyLimit$1,
      allSeries: everySeries$1,
      any: some$1,
      anyLimit: someLimit$1,
      anySeries: someSeries$1,
      find: detect$1,
      findLimit: detectLimit$1,
      findSeries: detectSeries$1,
      flatMap: concat$1,
      flatMapLimit: concatLimit$1,
      flatMapSeries: concatSeries$1,
      forEach: each,
      forEachSeries: eachSeries$1,
      forEachLimit: eachLimit$1,
      forEachOf: eachOf$1,
      forEachOfSeries: eachOfSeries$1,
      forEachOfLimit: eachOfLimit$1,
      inject: reduce$1,
      foldl: reduce$1,
      foldr: reduceRight,
      select: filter$1,
      selectLimit: filterLimit$1,
      selectSeries: filterSeries$1,
      wrapSync: asyncify,
      during: whilst$1,
      doDuring: doWhilst$1
    };
    exports2.all = every$1;
    exports2.allLimit = everyLimit$1;
    exports2.allSeries = everySeries$1;
    exports2.any = some$1;
    exports2.anyLimit = someLimit$1;
    exports2.anySeries = someSeries$1;
    exports2.apply = apply;
    exports2.applyEach = applyEach;
    exports2.applyEachSeries = applyEachSeries;
    exports2.asyncify = asyncify;
    exports2.auto = auto;
    exports2.autoInject = autoInject;
    exports2.cargo = cargo$1;
    exports2.cargoQueue = cargo;
    exports2.compose = compose;
    exports2.concat = concat$1;
    exports2.concatLimit = concatLimit$1;
    exports2.concatSeries = concatSeries$1;
    exports2.constant = constant$1;
    exports2.default = index;
    exports2.detect = detect$1;
    exports2.detectLimit = detectLimit$1;
    exports2.detectSeries = detectSeries$1;
    exports2.dir = dir;
    exports2.doDuring = doWhilst$1;
    exports2.doUntil = doUntil;
    exports2.doWhilst = doWhilst$1;
    exports2.during = whilst$1;
    exports2.each = each;
    exports2.eachLimit = eachLimit$1;
    exports2.eachOf = eachOf$1;
    exports2.eachOfLimit = eachOfLimit$1;
    exports2.eachOfSeries = eachOfSeries$1;
    exports2.eachSeries = eachSeries$1;
    exports2.ensureAsync = ensureAsync;
    exports2.every = every$1;
    exports2.everyLimit = everyLimit$1;
    exports2.everySeries = everySeries$1;
    exports2.filter = filter$1;
    exports2.filterLimit = filterLimit$1;
    exports2.filterSeries = filterSeries$1;
    exports2.find = detect$1;
    exports2.findLimit = detectLimit$1;
    exports2.findSeries = detectSeries$1;
    exports2.flatMap = concat$1;
    exports2.flatMapLimit = concatLimit$1;
    exports2.flatMapSeries = concatSeries$1;
    exports2.foldl = reduce$1;
    exports2.foldr = reduceRight;
    exports2.forEach = each;
    exports2.forEachLimit = eachLimit$1;
    exports2.forEachOf = eachOf$1;
    exports2.forEachOfLimit = eachOfLimit$1;
    exports2.forEachOfSeries = eachOfSeries$1;
    exports2.forEachSeries = eachSeries$1;
    exports2.forever = forever$1;
    exports2.groupBy = groupBy;
    exports2.groupByLimit = groupByLimit$1;
    exports2.groupBySeries = groupBySeries;
    exports2.inject = reduce$1;
    exports2.log = log;
    exports2.map = map$1;
    exports2.mapLimit = mapLimit$1;
    exports2.mapSeries = mapSeries$1;
    exports2.mapValues = mapValues;
    exports2.mapValuesLimit = mapValuesLimit$1;
    exports2.mapValuesSeries = mapValuesSeries;
    exports2.memoize = memoize;
    exports2.nextTick = nextTick;
    exports2.parallel = parallel;
    exports2.parallelLimit = parallelLimit;
    exports2.priorityQueue = priorityQueue;
    exports2.queue = queue;
    exports2.race = race$1;
    exports2.reduce = reduce$1;
    exports2.reduceRight = reduceRight;
    exports2.reflect = reflect;
    exports2.reflectAll = reflectAll;
    exports2.reject = reject$1;
    exports2.rejectLimit = rejectLimit$1;
    exports2.rejectSeries = rejectSeries$1;
    exports2.retry = retry;
    exports2.retryable = retryable;
    exports2.select = filter$1;
    exports2.selectLimit = filterLimit$1;
    exports2.selectSeries = filterSeries$1;
    exports2.seq = seq;
    exports2.series = series;
    exports2.setImmediate = setImmediate$1;
    exports2.some = some$1;
    exports2.someLimit = someLimit$1;
    exports2.someSeries = someSeries$1;
    exports2.sortBy = sortBy$1;
    exports2.timeout = timeout;
    exports2.times = times;
    exports2.timesLimit = timesLimit;
    exports2.timesSeries = timesSeries;
    exports2.transform = transform;
    exports2.tryEach = tryEach$1;
    exports2.unmemoize = unmemoize;
    exports2.until = until;
    exports2.waterfall = waterfall$1;
    exports2.whilst = whilst$1;
    exports2.wrapSync = asyncify;
    Object.defineProperty(exports2, "__esModule", { value: true });
  });
});

// ../../node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/polyfills.js
var require_polyfills = __commonJS((exports, module) => {
  var constants = __require("constants");
  var origCwd = process.cwd;
  var cwd = null;
  var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    if (!cwd)
      cwd = origCwd.call(process);
    return cwd;
  };
  try {
    process.cwd();
  } catch (er) {}
  if (typeof process.chdir === "function") {
    chdir = process.chdir;
    process.chdir = function(d) {
      cwd = null;
      chdir.call(process, d);
    };
    if (Object.setPrototypeOf)
      Object.setPrototypeOf(process.chdir, chdir);
  }
  var chdir;
  module.exports = patch;
  function patch(fs) {
    if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
      patchLchmod(fs);
    }
    if (!fs.lutimes) {
      patchLutimes(fs);
    }
    fs.chown = chownFix(fs.chown);
    fs.fchown = chownFix(fs.fchown);
    fs.lchown = chownFix(fs.lchown);
    fs.chmod = chmodFix(fs.chmod);
    fs.fchmod = chmodFix(fs.fchmod);
    fs.lchmod = chmodFix(fs.lchmod);
    fs.chownSync = chownFixSync(fs.chownSync);
    fs.fchownSync = chownFixSync(fs.fchownSync);
    fs.lchownSync = chownFixSync(fs.lchownSync);
    fs.chmodSync = chmodFixSync(fs.chmodSync);
    fs.fchmodSync = chmodFixSync(fs.fchmodSync);
    fs.lchmodSync = chmodFixSync(fs.lchmodSync);
    fs.stat = statFix(fs.stat);
    fs.fstat = statFix(fs.fstat);
    fs.lstat = statFix(fs.lstat);
    fs.statSync = statFixSync(fs.statSync);
    fs.fstatSync = statFixSync(fs.fstatSync);
    fs.lstatSync = statFixSync(fs.lstatSync);
    if (fs.chmod && !fs.lchmod) {
      fs.lchmod = function(path, mode, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs.lchmodSync = function() {};
    }
    if (fs.chown && !fs.lchown) {
      fs.lchown = function(path, uid, gid, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs.lchownSync = function() {};
    }
    if (platform === "win32") {
      fs.rename = typeof fs.rename !== "function" ? fs.rename : function(fs$rename) {
        function rename(from, to, cb) {
          var start = Date.now();
          var backoff = 0;
          fs$rename(from, to, function CB(er) {
            if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 60000) {
              setTimeout(function() {
                fs.stat(to, function(stater, st) {
                  if (stater && stater.code === "ENOENT")
                    fs$rename(from, to, CB);
                  else
                    cb(er);
                });
              }, backoff);
              if (backoff < 100)
                backoff += 10;
              return;
            }
            if (cb)
              cb(er);
          });
        }
        if (Object.setPrototypeOf)
          Object.setPrototypeOf(rename, fs$rename);
        return rename;
      }(fs.rename);
    }
    fs.read = typeof fs.read !== "function" ? fs.read : function(fs$read) {
      function read(fd, buffer, offset, length, position, callback_) {
        var callback;
        if (callback_ && typeof callback_ === "function") {
          var eagCounter = 0;
          callback = function(er, _2, __) {
            if (er && er.code === "EAGAIN" && eagCounter < 10) {
              eagCounter++;
              return fs$read.call(fs, fd, buffer, offset, length, position, callback);
            }
            callback_.apply(this, arguments);
          };
        }
        return fs$read.call(fs, fd, buffer, offset, length, position, callback);
      }
      if (Object.setPrototypeOf)
        Object.setPrototypeOf(read, fs$read);
      return read;
    }(fs.read);
    fs.readSync = typeof fs.readSync !== "function" ? fs.readSync : function(fs$readSync) {
      return function(fd, buffer, offset, length, position) {
        var eagCounter = 0;
        while (true) {
          try {
            return fs$readSync.call(fs, fd, buffer, offset, length, position);
          } catch (er) {
            if (er.code === "EAGAIN" && eagCounter < 10) {
              eagCounter++;
              continue;
            }
            throw er;
          }
        }
      };
    }(fs.readSync);
    function patchLchmod(fs2) {
      fs2.lchmod = function(path, mode, callback) {
        fs2.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, function(err, fd) {
          if (err) {
            if (callback)
              callback(err);
            return;
          }
          fs2.fchmod(fd, mode, function(err2) {
            fs2.close(fd, function(err22) {
              if (callback)
                callback(err2 || err22);
            });
          });
        });
      };
      fs2.lchmodSync = function(path, mode) {
        var fd = fs2.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
        var threw = true;
        var ret;
        try {
          ret = fs2.fchmodSync(fd, mode);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs2.closeSync(fd);
            } catch (er) {}
          } else {
            fs2.closeSync(fd);
          }
        }
        return ret;
      };
    }
    function patchLutimes(fs2) {
      if (constants.hasOwnProperty("O_SYMLINK") && fs2.futimes) {
        fs2.lutimes = function(path, at, mt, cb) {
          fs2.open(path, constants.O_SYMLINK, function(er, fd) {
            if (er) {
              if (cb)
                cb(er);
              return;
            }
            fs2.futimes(fd, at, mt, function(er2) {
              fs2.close(fd, function(er22) {
                if (cb)
                  cb(er2 || er22);
              });
            });
          });
        };
        fs2.lutimesSync = function(path, at, mt) {
          var fd = fs2.openSync(path, constants.O_SYMLINK);
          var ret;
          var threw = true;
          try {
            ret = fs2.futimesSync(fd, at, mt);
            threw = false;
          } finally {
            if (threw) {
              try {
                fs2.closeSync(fd);
              } catch (er) {}
            } else {
              fs2.closeSync(fd);
            }
          }
          return ret;
        };
      } else if (fs2.futimes) {
        fs2.lutimes = function(_a, _b, _c, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs2.lutimesSync = function() {};
      }
    }
    function chmodFix(orig) {
      if (!orig)
        return orig;
      return function(target, mode, cb) {
        return orig.call(fs, target, mode, function(er) {
          if (chownErOk(er))
            er = null;
          if (cb)
            cb.apply(this, arguments);
        });
      };
    }
    function chmodFixSync(orig) {
      if (!orig)
        return orig;
      return function(target, mode) {
        try {
          return orig.call(fs, target, mode);
        } catch (er) {
          if (!chownErOk(er))
            throw er;
        }
      };
    }
    function chownFix(orig) {
      if (!orig)
        return orig;
      return function(target, uid, gid, cb) {
        return orig.call(fs, target, uid, gid, function(er) {
          if (chownErOk(er))
            er = null;
          if (cb)
            cb.apply(this, arguments);
        });
      };
    }
    function chownFixSync(orig) {
      if (!orig)
        return orig;
      return function(target, uid, gid) {
        try {
          return orig.call(fs, target, uid, gid);
        } catch (er) {
          if (!chownErOk(er))
            throw er;
        }
      };
    }
    function statFix(orig) {
      if (!orig)
        return orig;
      return function(target, options, cb) {
        if (typeof options === "function") {
          cb = options;
          options = null;
        }
        function callback(er, stats) {
          if (stats) {
            if (stats.uid < 0)
              stats.uid += 4294967296;
            if (stats.gid < 0)
              stats.gid += 4294967296;
          }
          if (cb)
            cb.apply(this, arguments);
        }
        return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
      };
    }
    function statFixSync(orig) {
      if (!orig)
        return orig;
      return function(target, options) {
        var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
        if (stats) {
          if (stats.uid < 0)
            stats.uid += 4294967296;
          if (stats.gid < 0)
            stats.gid += 4294967296;
        }
        return stats;
      };
    }
    function chownErOk(er) {
      if (!er)
        return true;
      if (er.code === "ENOSYS")
        return true;
      var nonroot = !process.getuid || process.getuid() !== 0;
      if (nonroot) {
        if (er.code === "EINVAL" || er.code === "EPERM")
          return true;
      }
      return false;
    }
  }
});

// ../../node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/legacy-streams.js
var require_legacy_streams = __commonJS((exports, module) => {
  var Stream = __require("stream").Stream;
  module.exports = legacy;
  function legacy(fs) {
    return {
      ReadStream,
      WriteStream
    };
    function ReadStream(path, options) {
      if (!(this instanceof ReadStream))
        return new ReadStream(path, options);
      Stream.call(this);
      var self2 = this;
      this.path = path;
      this.fd = null;
      this.readable = true;
      this.paused = false;
      this.flags = "r";
      this.mode = 438;
      this.bufferSize = 64 * 1024;
      options = options || {};
      var keys = Object.keys(options);
      for (var index = 0, length = keys.length;index < length; index++) {
        var key = keys[index];
        this[key] = options[key];
      }
      if (this.encoding)
        this.setEncoding(this.encoding);
      if (this.start !== undefined) {
        if (typeof this.start !== "number") {
          throw TypeError("start must be a Number");
        }
        if (this.end === undefined) {
          this.end = Infinity;
        } else if (typeof this.end !== "number") {
          throw TypeError("end must be a Number");
        }
        if (this.start > this.end) {
          throw new Error("start must be <= end");
        }
        this.pos = this.start;
      }
      if (this.fd !== null) {
        process.nextTick(function() {
          self2._read();
        });
        return;
      }
      fs.open(this.path, this.flags, this.mode, function(err, fd) {
        if (err) {
          self2.emit("error", err);
          self2.readable = false;
          return;
        }
        self2.fd = fd;
        self2.emit("open", fd);
        self2._read();
      });
    }
    function WriteStream(path, options) {
      if (!(this instanceof WriteStream))
        return new WriteStream(path, options);
      Stream.call(this);
      this.path = path;
      this.fd = null;
      this.writable = true;
      this.flags = "w";
      this.encoding = "binary";
      this.mode = 438;
      this.bytesWritten = 0;
      options = options || {};
      var keys = Object.keys(options);
      for (var index = 0, length = keys.length;index < length; index++) {
        var key = keys[index];
        this[key] = options[key];
      }
      if (this.start !== undefined) {
        if (typeof this.start !== "number") {
          throw TypeError("start must be a Number");
        }
        if (this.start < 0) {
          throw new Error("start must be >= zero");
        }
        this.pos = this.start;
      }
      this.busy = false;
      this._queue = [];
      if (this.fd === null) {
        this._open = fs.open;
        this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
        this.flush();
      }
    }
  }
});

// ../../node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/clone.js
var require_clone = __commonJS((exports, module) => {
  module.exports = clone;
  var getPrototypeOf = Object.getPrototypeOf || function(obj) {
    return obj.__proto__;
  };
  function clone(obj) {
    if (obj === null || typeof obj !== "object")
      return obj;
    if (obj instanceof Object)
      var copy = { __proto__: getPrototypeOf(obj) };
    else
      var copy = Object.create(null);
    Object.getOwnPropertyNames(obj).forEach(function(key) {
      Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
    });
    return copy;
  }
});

// ../../node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/graceful-fs.js
var require_graceful_fs = __commonJS((exports, module) => {
  var fs = __require("fs");
  var polyfills = require_polyfills();
  var legacy = require_legacy_streams();
  var clone = require_clone();
  var util = __require("util");
  var gracefulQueue;
  var previousSymbol;
  if (typeof Symbol === "function" && typeof Symbol.for === "function") {
    gracefulQueue = Symbol.for("graceful-fs.queue");
    previousSymbol = Symbol.for("graceful-fs.previous");
  } else {
    gracefulQueue = "___graceful-fs.queue";
    previousSymbol = "___graceful-fs.previous";
  }
  function noop() {}
  function publishQueue(context, queue2) {
    Object.defineProperty(context, gracefulQueue, {
      get: function() {
        return queue2;
      }
    });
  }
  var debug = noop;
  if (util.debuglog)
    debug = util.debuglog("gfs4");
  else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
    debug = function() {
      var m = util.format.apply(util, arguments);
      m = "GFS4: " + m.split(/\n/).join(`
GFS4: `);
      console.error(m);
    };
  if (!fs[gracefulQueue]) {
    queue = global[gracefulQueue] || [];
    publishQueue(fs, queue);
    fs.close = function(fs$close) {
      function close(fd, cb) {
        return fs$close.call(fs, fd, function(err) {
          if (!err) {
            resetQueue();
          }
          if (typeof cb === "function")
            cb.apply(this, arguments);
        });
      }
      Object.defineProperty(close, previousSymbol, {
        value: fs$close
      });
      return close;
    }(fs.close);
    fs.closeSync = function(fs$closeSync) {
      function closeSync(fd) {
        fs$closeSync.apply(fs, arguments);
        resetQueue();
      }
      Object.defineProperty(closeSync, previousSymbol, {
        value: fs$closeSync
      });
      return closeSync;
    }(fs.closeSync);
    if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
      process.on("exit", function() {
        debug(fs[gracefulQueue]);
        __require("assert").equal(fs[gracefulQueue].length, 0);
      });
    }
  }
  var queue;
  if (!global[gracefulQueue]) {
    publishQueue(global, fs[gracefulQueue]);
  }
  module.exports = patch(clone(fs));
  if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
    module.exports = patch(fs);
    fs.__patched = true;
  }
  function patch(fs2) {
    polyfills(fs2);
    fs2.gracefulify = patch;
    fs2.createReadStream = createReadStream;
    fs2.createWriteStream = createWriteStream;
    var fs$readFile = fs2.readFile;
    fs2.readFile = readFile;
    function readFile(path, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      return go$readFile(path, options, cb);
      function go$readFile(path2, options2, cb2, startTime) {
        return fs$readFile(path2, options2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$readFile, [path2, options2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$writeFile = fs2.writeFile;
    fs2.writeFile = writeFile;
    function writeFile(path, data, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      return go$writeFile(path, data, options, cb);
      function go$writeFile(path2, data2, options2, cb2, startTime) {
        return fs$writeFile(path2, data2, options2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$writeFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$appendFile = fs2.appendFile;
    if (fs$appendFile)
      fs2.appendFile = appendFile;
    function appendFile(path, data, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      return go$appendFile(path, data, options, cb);
      function go$appendFile(path2, data2, options2, cb2, startTime) {
        return fs$appendFile(path2, data2, options2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$appendFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$copyFile = fs2.copyFile;
    if (fs$copyFile)
      fs2.copyFile = copyFile;
    function copyFile(src, dest, flags, cb) {
      if (typeof flags === "function") {
        cb = flags;
        flags = 0;
      }
      return go$copyFile(src, dest, flags, cb);
      function go$copyFile(src2, dest2, flags2, cb2, startTime) {
        return fs$copyFile(src2, dest2, flags2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$readdir = fs2.readdir;
    fs2.readdir = readdir;
    var noReaddirOptionVersions = /^v[0-5]\./;
    function readdir(path, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir(path2, options2, cb2, startTime) {
        return fs$readdir(path2, fs$readdirCallback(path2, options2, cb2, startTime));
      } : function go$readdir(path2, options2, cb2, startTime) {
        return fs$readdir(path2, options2, fs$readdirCallback(path2, options2, cb2, startTime));
      };
      return go$readdir(path, options, cb);
      function fs$readdirCallback(path2, options2, cb2, startTime) {
        return function(err, files) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([
              go$readdir,
              [path2, options2, cb2],
              err,
              startTime || Date.now(),
              Date.now()
            ]);
          else {
            if (files && files.sort)
              files.sort();
            if (typeof cb2 === "function")
              cb2.call(this, err, files);
          }
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var legStreams = legacy(fs2);
      ReadStream = legStreams.ReadStream;
      WriteStream = legStreams.WriteStream;
    }
    var fs$ReadStream = fs2.ReadStream;
    if (fs$ReadStream) {
      ReadStream.prototype = Object.create(fs$ReadStream.prototype);
      ReadStream.prototype.open = ReadStream$open;
    }
    var fs$WriteStream = fs2.WriteStream;
    if (fs$WriteStream) {
      WriteStream.prototype = Object.create(fs$WriteStream.prototype);
      WriteStream.prototype.open = WriteStream$open;
    }
    Object.defineProperty(fs2, "ReadStream", {
      get: function() {
        return ReadStream;
      },
      set: function(val) {
        ReadStream = val;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(fs2, "WriteStream", {
      get: function() {
        return WriteStream;
      },
      set: function(val) {
        WriteStream = val;
      },
      enumerable: true,
      configurable: true
    });
    var FileReadStream = ReadStream;
    Object.defineProperty(fs2, "FileReadStream", {
      get: function() {
        return FileReadStream;
      },
      set: function(val) {
        FileReadStream = val;
      },
      enumerable: true,
      configurable: true
    });
    var FileWriteStream = WriteStream;
    Object.defineProperty(fs2, "FileWriteStream", {
      get: function() {
        return FileWriteStream;
      },
      set: function(val) {
        FileWriteStream = val;
      },
      enumerable: true,
      configurable: true
    });
    function ReadStream(path, options) {
      if (this instanceof ReadStream)
        return fs$ReadStream.apply(this, arguments), this;
      else
        return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
    }
    function ReadStream$open() {
      var that = this;
      open(that.path, that.flags, that.mode, function(err, fd) {
        if (err) {
          if (that.autoClose)
            that.destroy();
          that.emit("error", err);
        } else {
          that.fd = fd;
          that.emit("open", fd);
          that.read();
        }
      });
    }
    function WriteStream(path, options) {
      if (this instanceof WriteStream)
        return fs$WriteStream.apply(this, arguments), this;
      else
        return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
    }
    function WriteStream$open() {
      var that = this;
      open(that.path, that.flags, that.mode, function(err, fd) {
        if (err) {
          that.destroy();
          that.emit("error", err);
        } else {
          that.fd = fd;
          that.emit("open", fd);
        }
      });
    }
    function createReadStream(path, options) {
      return new fs2.ReadStream(path, options);
    }
    function createWriteStream(path, options) {
      return new fs2.WriteStream(path, options);
    }
    var fs$open = fs2.open;
    fs2.open = open;
    function open(path, flags, mode, cb) {
      if (typeof mode === "function")
        cb = mode, mode = null;
      return go$open(path, flags, mode, cb);
      function go$open(path2, flags2, mode2, cb2, startTime) {
        return fs$open(path2, flags2, mode2, function(err, fd) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$open, [path2, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    return fs2;
  }
  function enqueue(elem) {
    debug("ENQUEUE", elem[0].name, elem[1]);
    fs[gracefulQueue].push(elem);
    retry();
  }
  var retryTimer;
  function resetQueue() {
    var now = Date.now();
    for (var i = 0;i < fs[gracefulQueue].length; ++i) {
      if (fs[gracefulQueue][i].length > 2) {
        fs[gracefulQueue][i][3] = now;
        fs[gracefulQueue][i][4] = now;
      }
    }
    retry();
  }
  function retry() {
    clearTimeout(retryTimer);
    retryTimer = undefined;
    if (fs[gracefulQueue].length === 0)
      return;
    var elem = fs[gracefulQueue].shift();
    var fn = elem[0];
    var args = elem[1];
    var err = elem[2];
    var startTime = elem[3];
    var lastTime = elem[4];
    if (startTime === undefined) {
      debug("RETRY", fn.name, args);
      fn.apply(null, args);
    } else if (Date.now() - startTime >= 60000) {
      debug("TIMEOUT", fn.name, args);
      var cb = args.pop();
      if (typeof cb === "function")
        cb.call(null, err);
    } else {
      var sinceAttempt = Date.now() - lastTime;
      var sinceStart = Math.max(lastTime - startTime, 1);
      var desiredDelay = Math.min(sinceStart * 1.2, 100);
      if (sinceAttempt >= desiredDelay) {
        debug("RETRY", fn.name, args);
        fn.apply(null, args.concat([startTime]));
      } else {
        fs[gracefulQueue].push(elem);
      }
    }
    if (retryTimer === undefined) {
      retryTimer = setTimeout(retry, 0);
    }
  }
});

// ../../node_modules/.pnpm/is-stream@2.0.1/node_modules/is-stream/index.js
var require_is_stream = __commonJS((exports, module) => {
  var isStream = (stream) => stream !== null && typeof stream === "object" && typeof stream.pipe === "function";
  isStream.writable = (stream) => isStream(stream) && stream.writable !== false && typeof stream._write === "function" && typeof stream._writableState === "object";
  isStream.readable = (stream) => isStream(stream) && stream.readable !== false && typeof stream._read === "function" && typeof stream._readableState === "object";
  isStream.duplex = (stream) => isStream.writable(stream) && isStream.readable(stream);
  isStream.transform = (stream) => isStream.duplex(stream) && typeof stream._transform === "function";
  module.exports = isStream;
});

// ../../node_modules/.pnpm/process-nextick-args@2.0.1/node_modules/process-nextick-args/index.js
var require_process_nextick_args = __commonJS((exports, module) => {
  if (typeof process === "undefined" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0) {
    module.exports = { nextTick };
  } else {
    module.exports = process;
  }
  function nextTick(fn, arg1, arg2, arg3) {
    if (typeof fn !== "function") {
      throw new TypeError('"callback" argument must be a function');
    }
    var len = arguments.length;
    var args, i;
    switch (len) {
      case 0:
      case 1:
        return process.nextTick(fn);
      case 2:
        return process.nextTick(function afterTickOne() {
          fn.call(null, arg1);
        });
      case 3:
        return process.nextTick(function afterTickTwo() {
          fn.call(null, arg1, arg2);
        });
      case 4:
        return process.nextTick(function afterTickThree() {
          fn.call(null, arg1, arg2, arg3);
        });
      default:
        args = new Array(len - 1);
        i = 0;
        while (i < args.length) {
          args[i++] = arguments[i];
        }
        return process.nextTick(function afterTick() {
          fn.apply(null, args);
        });
    }
  }
});

// ../../node_modules/.pnpm/isarray@1.0.0/node_modules/isarray/index.js
var require_isarray = __commonJS((exports, module) => {
  var toString = {}.toString;
  module.exports = Array.isArray || function(arr) {
    return toString.call(arr) == "[object Array]";
  };
});

// ../../node_modules/.pnpm/safe-buffer@5.1.2/node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS((exports, module) => {
  var buffer = __require("buffer");
  var Buffer2 = buffer.Buffer;
  function copyProps(src, dst) {
    for (var key in src) {
      dst[key] = src[key];
    }
  }
  if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
    module.exports = buffer;
  } else {
    copyProps(buffer, exports);
    exports.Buffer = SafeBuffer;
  }
  function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer2(arg, encodingOrOffset, length);
  }
  copyProps(Buffer2, SafeBuffer);
  SafeBuffer.from = function(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      throw new TypeError("Argument must not be a number");
    }
    return Buffer2(arg, encodingOrOffset, length);
  };
  SafeBuffer.alloc = function(size, fill, encoding) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    var buf = Buffer2(size);
    if (fill !== undefined) {
      if (typeof encoding === "string") {
        buf.fill(fill, encoding);
      } else {
        buf.fill(fill);
      }
    } else {
      buf.fill(0);
    }
    return buf;
  };
  SafeBuffer.allocUnsafe = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return Buffer2(size);
  };
  SafeBuffer.allocUnsafeSlow = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return buffer.SlowBuffer(size);
  };
});

// ../../node_modules/.pnpm/core-util-is@1.0.3/node_modules/core-util-is/lib/util.js
var require_util = __commonJS((exports) => {
  function isArray(arg) {
    if (Array.isArray) {
      return Array.isArray(arg);
    }
    return objectToString(arg) === "[object Array]";
  }
  exports.isArray = isArray;
  function isBoolean(arg) {
    return typeof arg === "boolean";
  }
  exports.isBoolean = isBoolean;
  function isNull(arg) {
    return arg === null;
  }
  exports.isNull = isNull;
  function isNullOrUndefined(arg) {
    return arg == null;
  }
  exports.isNullOrUndefined = isNullOrUndefined;
  function isNumber(arg) {
    return typeof arg === "number";
  }
  exports.isNumber = isNumber;
  function isString(arg) {
    return typeof arg === "string";
  }
  exports.isString = isString;
  function isSymbol(arg) {
    return typeof arg === "symbol";
  }
  exports.isSymbol = isSymbol;
  function isUndefined(arg) {
    return arg === undefined;
  }
  exports.isUndefined = isUndefined;
  function isRegExp(re) {
    return objectToString(re) === "[object RegExp]";
  }
  exports.isRegExp = isRegExp;
  function isObject(arg) {
    return typeof arg === "object" && arg !== null;
  }
  exports.isObject = isObject;
  function isDate(d) {
    return objectToString(d) === "[object Date]";
  }
  exports.isDate = isDate;
  function isError(e) {
    return objectToString(e) === "[object Error]" || e instanceof Error;
  }
  exports.isError = isError;
  function isFunction(arg) {
    return typeof arg === "function";
  }
  exports.isFunction = isFunction;
  function isPrimitive(arg) {
    return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || typeof arg === "undefined";
  }
  exports.isPrimitive = isPrimitive;
  exports.isBuffer = __require("buffer").Buffer.isBuffer;
  function objectToString(o) {
    return Object.prototype.toString.call(o);
  }
});

// ../../node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS((exports, module) => {
  if (typeof Object.create === "function") {
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor;
        ctor.prototype.constructor = ctor;
      }
    };
  }
});

// ../../node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js
var require_inherits = __commonJS((exports, module) => {
  try {
    util = __require("util");
    if (typeof util.inherits !== "function")
      throw "";
    module.exports = util.inherits;
  } catch (e) {
    module.exports = require_inherits_browser();
  }
  var util;
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/internal/streams/BufferList.js
var require_BufferList = __commonJS((exports, module) => {
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  var Buffer2 = require_safe_buffer().Buffer;
  var util = __require("util");
  function copyBuffer(src, target, offset) {
    src.copy(target, offset);
  }
  module.exports = function() {
    function BufferList() {
      _classCallCheck(this, BufferList);
      this.head = null;
      this.tail = null;
      this.length = 0;
    }
    BufferList.prototype.push = function push(v) {
      var entry = { data: v, next: null };
      if (this.length > 0)
        this.tail.next = entry;
      else
        this.head = entry;
      this.tail = entry;
      ++this.length;
    };
    BufferList.prototype.unshift = function unshift(v) {
      var entry = { data: v, next: this.head };
      if (this.length === 0)
        this.tail = entry;
      this.head = entry;
      ++this.length;
    };
    BufferList.prototype.shift = function shift() {
      if (this.length === 0)
        return;
      var ret = this.head.data;
      if (this.length === 1)
        this.head = this.tail = null;
      else
        this.head = this.head.next;
      --this.length;
      return ret;
    };
    BufferList.prototype.clear = function clear() {
      this.head = this.tail = null;
      this.length = 0;
    };
    BufferList.prototype.join = function join(s) {
      if (this.length === 0)
        return "";
      var p = this.head;
      var ret = "" + p.data;
      while (p = p.next) {
        ret += s + p.data;
      }
      return ret;
    };
    BufferList.prototype.concat = function concat(n) {
      if (this.length === 0)
        return Buffer2.alloc(0);
      var ret = Buffer2.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;
      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }
      return ret;
    };
    return BufferList;
  }();
  if (util && util.inspect && util.inspect.custom) {
    module.exports.prototype[util.inspect.custom] = function() {
      var obj = util.inspect({ length: this.length });
      return this.constructor.name + " " + obj;
    };
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS((exports, module) => {
  var pna = require_process_nextick_args();
  function destroy(err, cb) {
    var _this = this;
    var readableDestroyed = this._readableState && this._readableState.destroyed;
    var writableDestroyed = this._writableState && this._writableState.destroyed;
    if (readableDestroyed || writableDestroyed) {
      if (cb) {
        cb(err);
      } else if (err) {
        if (!this._writableState) {
          pna.nextTick(emitErrorNT, this, err);
        } else if (!this._writableState.errorEmitted) {
          this._writableState.errorEmitted = true;
          pna.nextTick(emitErrorNT, this, err);
        }
      }
      return this;
    }
    if (this._readableState) {
      this._readableState.destroyed = true;
    }
    if (this._writableState) {
      this._writableState.destroyed = true;
    }
    this._destroy(err || null, function(err2) {
      if (!cb && err2) {
        if (!_this._writableState) {
          pna.nextTick(emitErrorNT, _this, err2);
        } else if (!_this._writableState.errorEmitted) {
          _this._writableState.errorEmitted = true;
          pna.nextTick(emitErrorNT, _this, err2);
        }
      } else if (cb) {
        cb(err2);
      }
    });
    return this;
  }
  function undestroy() {
    if (this._readableState) {
      this._readableState.destroyed = false;
      this._readableState.reading = false;
      this._readableState.ended = false;
      this._readableState.endEmitted = false;
    }
    if (this._writableState) {
      this._writableState.destroyed = false;
      this._writableState.ended = false;
      this._writableState.ending = false;
      this._writableState.finalCalled = false;
      this._writableState.prefinished = false;
      this._writableState.finished = false;
      this._writableState.errorEmitted = false;
    }
  }
  function emitErrorNT(self2, err) {
    self2.emit("error", err);
  }
  module.exports = {
    destroy,
    undestroy
  };
});

// ../../node_modules/.pnpm/util-deprecate@1.0.2/node_modules/util-deprecate/node.js
var require_node = __commonJS((exports, module) => {
  module.exports = __require("util").deprecate;
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_writable.js
var require__stream_writable = __commonJS((exports, module) => {
  var pna = require_process_nextick_args();
  module.exports = Writable;
  function CorkedRequest(state) {
    var _this = this;
    this.next = null;
    this.entry = null;
    this.finish = function() {
      onCorkedFinish(_this, state);
    };
  }
  var asyncWrite = ["v0.10", "v0.9."].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
  var Duplex;
  Writable.WritableState = WritableState;
  var util = Object.create(require_util());
  util.inherits = require_inherits();
  var internalUtil = {
    deprecate: require_node()
  };
  var Stream = __require("stream");
  var Buffer2 = require_safe_buffer().Buffer;
  var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {};
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var destroyImpl = require_destroy();
  util.inherits(Writable, Stream);
  function nop() {}
  function WritableState(options, stream) {
    Duplex = Duplex || require__stream_duplex();
    options = options || {};
    var isDuplex = stream instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex)
      this.objectMode = this.objectMode || !!options.writableObjectMode;
    var hwm = options.highWaterMark;
    var writableHwm = options.writableHighWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    if (hwm || hwm === 0)
      this.highWaterMark = hwm;
    else if (isDuplex && (writableHwm || writableHwm === 0))
      this.highWaterMark = writableHwm;
    else
      this.highWaterMark = defaultHwm;
    this.highWaterMark = Math.floor(this.highWaterMark);
    this.finalCalled = false;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    this.destroyed = false;
    var noDecode = options.decodeStrings === false;
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = function(er) {
      onwrite(stream, er);
    };
    this.writecb = null;
    this.writelen = 0;
    this.bufferedRequest = null;
    this.lastBufferedRequest = null;
    this.pendingcb = 0;
    this.prefinished = false;
    this.errorEmitted = false;
    this.bufferedRequestCount = 0;
    this.corkedRequestsFree = new CorkedRequest(this);
  }
  WritableState.prototype.getBuffer = function getBuffer() {
    var current = this.bufferedRequest;
    var out = [];
    while (current) {
      out.push(current);
      current = current.next;
    }
    return out;
  };
  (function() {
    try {
      Object.defineProperty(WritableState.prototype, "buffer", {
        get: internalUtil.deprecate(function() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer " + "instead.", "DEP0003")
      });
    } catch (_2) {}
  })();
  var realHasInstance;
  if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
    realHasInstance = Function.prototype[Symbol.hasInstance];
    Object.defineProperty(Writable, Symbol.hasInstance, {
      value: function(object) {
        if (realHasInstance.call(this, object))
          return true;
        if (this !== Writable)
          return false;
        return object && object._writableState instanceof WritableState;
      }
    });
  } else {
    realHasInstance = function(object) {
      return object instanceof this;
    };
  }
  function Writable(options) {
    Duplex = Duplex || require__stream_duplex();
    if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
      return new Writable(options);
    }
    this._writableState = new WritableState(options, this);
    this.writable = true;
    if (options) {
      if (typeof options.write === "function")
        this._write = options.write;
      if (typeof options.writev === "function")
        this._writev = options.writev;
      if (typeof options.destroy === "function")
        this._destroy = options.destroy;
      if (typeof options.final === "function")
        this._final = options.final;
    }
    Stream.call(this);
  }
  Writable.prototype.pipe = function() {
    this.emit("error", new Error("Cannot pipe, not readable"));
  };
  function writeAfterEnd(stream, cb) {
    var er = new Error("write after end");
    stream.emit("error", er);
    pna.nextTick(cb, er);
  }
  function validChunk(stream, state, chunk, cb) {
    var valid = true;
    var er = false;
    if (chunk === null) {
      er = new TypeError("May not write null values to stream");
    } else if (typeof chunk !== "string" && chunk !== undefined && !state.objectMode) {
      er = new TypeError("Invalid non-string/buffer chunk");
    }
    if (er) {
      stream.emit("error", er);
      pna.nextTick(cb, er);
      valid = false;
    }
    return valid;
  }
  Writable.prototype.write = function(chunk, encoding, cb) {
    var state = this._writableState;
    var ret = false;
    var isBuf = !state.objectMode && _isUint8Array(chunk);
    if (isBuf && !Buffer2.isBuffer(chunk)) {
      chunk = _uint8ArrayToBuffer(chunk);
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (isBuf)
      encoding = "buffer";
    else if (!encoding)
      encoding = state.defaultEncoding;
    if (typeof cb !== "function")
      cb = nop;
    if (state.ended)
      writeAfterEnd(this, cb);
    else if (isBuf || validChunk(this, state, chunk, cb)) {
      state.pendingcb++;
      ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
    }
    return ret;
  };
  Writable.prototype.cork = function() {
    var state = this._writableState;
    state.corked++;
  };
  Writable.prototype.uncork = function() {
    var state = this._writableState;
    if (state.corked) {
      state.corked--;
      if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest)
        clearBuffer(this, state);
    }
  };
  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === "string")
      encoding = encoding.toLowerCase();
    if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1))
      throw new TypeError("Unknown encoding: " + encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
  };
  function decodeChunk(state, chunk, encoding) {
    if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
      chunk = Buffer2.from(chunk, encoding);
    }
    return chunk;
  }
  Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
    enumerable: false,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
    if (!isBuf) {
      var newChunk = decodeChunk(state, chunk, encoding);
      if (chunk !== newChunk) {
        isBuf = true;
        encoding = "buffer";
        chunk = newChunk;
      }
    }
    var len = state.objectMode ? 1 : chunk.length;
    state.length += len;
    var ret = state.length < state.highWaterMark;
    if (!ret)
      state.needDrain = true;
    if (state.writing || state.corked) {
      var last = state.lastBufferedRequest;
      state.lastBufferedRequest = {
        chunk,
        encoding,
        isBuf,
        callback: cb,
        next: null
      };
      if (last) {
        last.next = state.lastBufferedRequest;
      } else {
        state.bufferedRequest = state.lastBufferedRequest;
      }
      state.bufferedRequestCount += 1;
    } else {
      doWrite(stream, state, false, len, chunk, encoding, cb);
    }
    return ret;
  }
  function doWrite(stream, state, writev, len, chunk, encoding, cb) {
    state.writelen = len;
    state.writecb = cb;
    state.writing = true;
    state.sync = true;
    if (writev)
      stream._writev(chunk, state.onwrite);
    else
      stream._write(chunk, encoding, state.onwrite);
    state.sync = false;
  }
  function onwriteError(stream, state, sync, er, cb) {
    --state.pendingcb;
    if (sync) {
      pna.nextTick(cb, er);
      pna.nextTick(finishMaybe, stream, state);
      stream._writableState.errorEmitted = true;
      stream.emit("error", er);
    } else {
      cb(er);
      stream._writableState.errorEmitted = true;
      stream.emit("error", er);
      finishMaybe(stream, state);
    }
  }
  function onwriteStateUpdate(state) {
    state.writing = false;
    state.writecb = null;
    state.length -= state.writelen;
    state.writelen = 0;
  }
  function onwrite(stream, er) {
    var state = stream._writableState;
    var sync = state.sync;
    var cb = state.writecb;
    onwriteStateUpdate(state);
    if (er)
      onwriteError(stream, state, sync, er, cb);
    else {
      var finished = needFinish(state);
      if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
        clearBuffer(stream, state);
      }
      if (sync) {
        asyncWrite(afterWrite, stream, state, finished, cb);
      } else {
        afterWrite(stream, state, finished, cb);
      }
    }
  }
  function afterWrite(stream, state, finished, cb) {
    if (!finished)
      onwriteDrain(stream, state);
    state.pendingcb--;
    cb();
    finishMaybe(stream, state);
  }
  function onwriteDrain(stream, state) {
    if (state.length === 0 && state.needDrain) {
      state.needDrain = false;
      stream.emit("drain");
    }
  }
  function clearBuffer(stream, state) {
    state.bufferProcessing = true;
    var entry = state.bufferedRequest;
    if (stream._writev && entry && entry.next) {
      var l = state.bufferedRequestCount;
      var buffer = new Array(l);
      var holder = state.corkedRequestsFree;
      holder.entry = entry;
      var count = 0;
      var allBuffers = true;
      while (entry) {
        buffer[count] = entry;
        if (!entry.isBuf)
          allBuffers = false;
        entry = entry.next;
        count += 1;
      }
      buffer.allBuffers = allBuffers;
      doWrite(stream, state, true, state.length, buffer, "", holder.finish);
      state.pendingcb++;
      state.lastBufferedRequest = null;
      if (holder.next) {
        state.corkedRequestsFree = holder.next;
        holder.next = null;
      } else {
        state.corkedRequestsFree = new CorkedRequest(state);
      }
      state.bufferedRequestCount = 0;
    } else {
      while (entry) {
        var chunk = entry.chunk;
        var encoding = entry.encoding;
        var cb = entry.callback;
        var len = state.objectMode ? 1 : chunk.length;
        doWrite(stream, state, false, len, chunk, encoding, cb);
        entry = entry.next;
        state.bufferedRequestCount--;
        if (state.writing) {
          break;
        }
      }
      if (entry === null)
        state.lastBufferedRequest = null;
    }
    state.bufferedRequest = entry;
    state.bufferProcessing = false;
  }
  Writable.prototype._write = function(chunk, encoding, cb) {
    cb(new Error("_write() is not implemented"));
  };
  Writable.prototype._writev = null;
  Writable.prototype.end = function(chunk, encoding, cb) {
    var state = this._writableState;
    if (typeof chunk === "function") {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (chunk !== null && chunk !== undefined)
      this.write(chunk, encoding);
    if (state.corked) {
      state.corked = 1;
      this.uncork();
    }
    if (!state.ending)
      endWritable(this, state, cb);
  };
  function needFinish(state) {
    return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
  }
  function callFinal(stream, state) {
    stream._final(function(err) {
      state.pendingcb--;
      if (err) {
        stream.emit("error", err);
      }
      state.prefinished = true;
      stream.emit("prefinish");
      finishMaybe(stream, state);
    });
  }
  function prefinish(stream, state) {
    if (!state.prefinished && !state.finalCalled) {
      if (typeof stream._final === "function") {
        state.pendingcb++;
        state.finalCalled = true;
        pna.nextTick(callFinal, stream, state);
      } else {
        state.prefinished = true;
        stream.emit("prefinish");
      }
    }
  }
  function finishMaybe(stream, state) {
    var need = needFinish(state);
    if (need) {
      prefinish(stream, state);
      if (state.pendingcb === 0) {
        state.finished = true;
        stream.emit("finish");
      }
    }
    return need;
  }
  function endWritable(stream, state, cb) {
    state.ending = true;
    finishMaybe(stream, state);
    if (cb) {
      if (state.finished)
        pna.nextTick(cb);
      else
        stream.once("finish", cb);
    }
    state.ended = true;
    stream.writable = false;
  }
  function onCorkedFinish(corkReq, state, err) {
    var entry = corkReq.entry;
    corkReq.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    state.corkedRequestsFree.next = corkReq;
  }
  Object.defineProperty(Writable.prototype, "destroyed", {
    get: function() {
      if (this._writableState === undefined) {
        return false;
      }
      return this._writableState.destroyed;
    },
    set: function(value) {
      if (!this._writableState) {
        return;
      }
      this._writableState.destroyed = value;
    }
  });
  Writable.prototype.destroy = destroyImpl.destroy;
  Writable.prototype._undestroy = destroyImpl.undestroy;
  Writable.prototype._destroy = function(err, cb) {
    this.end();
    cb(err);
  };
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_duplex.js
var require__stream_duplex = __commonJS((exports, module) => {
  var pna = require_process_nextick_args();
  var objectKeys = Object.keys || function(obj) {
    var keys2 = [];
    for (var key in obj) {
      keys2.push(key);
    }
    return keys2;
  };
  module.exports = Duplex;
  var util = Object.create(require_util());
  util.inherits = require_inherits();
  var Readable = require__stream_readable();
  var Writable = require__stream_writable();
  util.inherits(Duplex, Readable);
  {
    keys = objectKeys(Writable.prototype);
    for (v = 0;v < keys.length; v++) {
      method = keys[v];
      if (!Duplex.prototype[method])
        Duplex.prototype[method] = Writable.prototype[method];
    }
  }
  var keys;
  var method;
  var v;
  function Duplex(options) {
    if (!(this instanceof Duplex))
      return new Duplex(options);
    Readable.call(this, options);
    Writable.call(this, options);
    if (options && options.readable === false)
      this.readable = false;
    if (options && options.writable === false)
      this.writable = false;
    this.allowHalfOpen = true;
    if (options && options.allowHalfOpen === false)
      this.allowHalfOpen = false;
    this.once("end", onend);
  }
  Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
    enumerable: false,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function onend() {
    if (this.allowHalfOpen || this._writableState.ended)
      return;
    pna.nextTick(onEndNT, this);
  }
  function onEndNT(self2) {
    self2.end();
  }
  Object.defineProperty(Duplex.prototype, "destroyed", {
    get: function() {
      if (this._readableState === undefined || this._writableState === undefined) {
        return false;
      }
      return this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function(value) {
      if (this._readableState === undefined || this._writableState === undefined) {
        return;
      }
      this._readableState.destroyed = value;
      this._writableState.destroyed = value;
    }
  });
  Duplex.prototype._destroy = function(err, cb) {
    this.push(null);
    this.end();
    pna.nextTick(cb, err);
  };
});

// ../../node_modules/.pnpm/string_decoder@1.1.1/node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS((exports) => {
  var Buffer2 = require_safe_buffer().Buffer;
  var isEncoding = Buffer2.isEncoding || function(encoding) {
    encoding = "" + encoding;
    switch (encoding && encoding.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return true;
      default:
        return false;
    }
  };
  function _normalizeEncoding(enc) {
    if (!enc)
      return "utf8";
    var retried;
    while (true) {
      switch (enc) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return enc;
        default:
          if (retried)
            return;
          enc = ("" + enc).toLowerCase();
          retried = true;
      }
    }
  }
  function normalizeEncoding(enc) {
    var nenc = _normalizeEncoding(enc);
    if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc)))
      throw new Error("Unknown encoding: " + enc);
    return nenc || enc;
  }
  exports.StringDecoder = StringDecoder;
  function StringDecoder(encoding) {
    this.encoding = normalizeEncoding(encoding);
    var nb;
    switch (this.encoding) {
      case "utf16le":
        this.text = utf16Text;
        this.end = utf16End;
        nb = 4;
        break;
      case "utf8":
        this.fillLast = utf8FillLast;
        nb = 4;
        break;
      case "base64":
        this.text = base64Text;
        this.end = base64End;
        nb = 3;
        break;
      default:
        this.write = simpleWrite;
        this.end = simpleEnd;
        return;
    }
    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = Buffer2.allocUnsafe(nb);
  }
  StringDecoder.prototype.write = function(buf) {
    if (buf.length === 0)
      return "";
    var r;
    var i;
    if (this.lastNeed) {
      r = this.fillLast(buf);
      if (r === undefined)
        return "";
      i = this.lastNeed;
      this.lastNeed = 0;
    } else {
      i = 0;
    }
    if (i < buf.length)
      return r ? r + this.text(buf, i) : this.text(buf, i);
    return r || "";
  };
  StringDecoder.prototype.end = utf8End;
  StringDecoder.prototype.text = utf8Text;
  StringDecoder.prototype.fillLast = function(buf) {
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
    this.lastNeed -= buf.length;
  };
  function utf8CheckByte(byte) {
    if (byte <= 127)
      return 0;
    else if (byte >> 5 === 6)
      return 2;
    else if (byte >> 4 === 14)
      return 3;
    else if (byte >> 3 === 30)
      return 4;
    return byte >> 6 === 2 ? -1 : -2;
  }
  function utf8CheckIncomplete(self2, buf, i) {
    var j = buf.length - 1;
    if (j < i)
      return 0;
    var nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0)
        self2.lastNeed = nb - 1;
      return nb;
    }
    if (--j < i || nb === -2)
      return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0)
        self2.lastNeed = nb - 2;
      return nb;
    }
    if (--j < i || nb === -2)
      return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) {
        if (nb === 2)
          nb = 0;
        else
          self2.lastNeed = nb - 3;
      }
      return nb;
    }
    return 0;
  }
  function utf8CheckExtraBytes(self2, buf, p) {
    if ((buf[0] & 192) !== 128) {
      self2.lastNeed = 0;
      return "�";
    }
    if (self2.lastNeed > 1 && buf.length > 1) {
      if ((buf[1] & 192) !== 128) {
        self2.lastNeed = 1;
        return "�";
      }
      if (self2.lastNeed > 2 && buf.length > 2) {
        if ((buf[2] & 192) !== 128) {
          self2.lastNeed = 2;
          return "�";
        }
      }
    }
  }
  function utf8FillLast(buf) {
    var p = this.lastTotal - this.lastNeed;
    var r = utf8CheckExtraBytes(this, buf, p);
    if (r !== undefined)
      return r;
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, p, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, p, 0, buf.length);
    this.lastNeed -= buf.length;
  }
  function utf8Text(buf, i) {
    var total = utf8CheckIncomplete(this, buf, i);
    if (!this.lastNeed)
      return buf.toString("utf8", i);
    this.lastTotal = total;
    var end = buf.length - (total - this.lastNeed);
    buf.copy(this.lastChar, 0, end);
    return buf.toString("utf8", i, end);
  }
  function utf8End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed)
      return r + "�";
    return r;
  }
  function utf16Text(buf, i) {
    if ((buf.length - i) % 2 === 0) {
      var r = buf.toString("utf16le", i);
      if (r) {
        var c = r.charCodeAt(r.length - 1);
        if (c >= 55296 && c <= 56319) {
          this.lastNeed = 2;
          this.lastTotal = 4;
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
          return r.slice(0, -1);
        }
      }
      return r;
    }
    this.lastNeed = 1;
    this.lastTotal = 2;
    this.lastChar[0] = buf[buf.length - 1];
    return buf.toString("utf16le", i, buf.length - 1);
  }
  function utf16End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) {
      var end = this.lastTotal - this.lastNeed;
      return r + this.lastChar.toString("utf16le", 0, end);
    }
    return r;
  }
  function base64Text(buf, i) {
    var n = (buf.length - i) % 3;
    if (n === 0)
      return buf.toString("base64", i);
    this.lastNeed = 3 - n;
    this.lastTotal = 3;
    if (n === 1) {
      this.lastChar[0] = buf[buf.length - 1];
    } else {
      this.lastChar[0] = buf[buf.length - 2];
      this.lastChar[1] = buf[buf.length - 1];
    }
    return buf.toString("base64", i, buf.length - n);
  }
  function base64End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed)
      return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
    return r;
  }
  function simpleWrite(buf) {
    return buf.toString(this.encoding);
  }
  function simpleEnd(buf) {
    return buf && buf.length ? this.write(buf) : "";
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_readable.js
var require__stream_readable = __commonJS((exports, module) => {
  var pna = require_process_nextick_args();
  module.exports = Readable;
  var isArray = require_isarray();
  var Duplex;
  Readable.ReadableState = ReadableState;
  var EE = __require("events").EventEmitter;
  var EElistenerCount = function(emitter, type) {
    return emitter.listeners(type).length;
  };
  var Stream = __require("stream");
  var Buffer2 = require_safe_buffer().Buffer;
  var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {};
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var util = Object.create(require_util());
  util.inherits = require_inherits();
  var debugUtil = __require("util");
  var debug = undefined;
  if (debugUtil && debugUtil.debuglog) {
    debug = debugUtil.debuglog("stream");
  } else {
    debug = function() {};
  }
  var BufferList = require_BufferList();
  var destroyImpl = require_destroy();
  var StringDecoder;
  util.inherits(Readable, Stream);
  var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
  function prependListener(emitter, event, fn) {
    if (typeof emitter.prependListener === "function")
      return emitter.prependListener(event, fn);
    if (!emitter._events || !emitter._events[event])
      emitter.on(event, fn);
    else if (isArray(emitter._events[event]))
      emitter._events[event].unshift(fn);
    else
      emitter._events[event] = [fn, emitter._events[event]];
  }
  function ReadableState(options, stream) {
    Duplex = Duplex || require__stream_duplex();
    options = options || {};
    var isDuplex = stream instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex)
      this.objectMode = this.objectMode || !!options.readableObjectMode;
    var hwm = options.highWaterMark;
    var readableHwm = options.readableHighWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    if (hwm || hwm === 0)
      this.highWaterMark = hwm;
    else if (isDuplex && (readableHwm || readableHwm === 0))
      this.highWaterMark = readableHwm;
    else
      this.highWaterMark = defaultHwm;
    this.highWaterMark = Math.floor(this.highWaterMark);
    this.buffer = new BufferList;
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;
    this.sync = true;
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;
    this.destroyed = false;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.awaitDrain = 0;
    this.readingMore = false;
    this.decoder = null;
    this.encoding = null;
    if (options.encoding) {
      if (!StringDecoder)
        StringDecoder = require_string_decoder().StringDecoder;
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  function Readable(options) {
    Duplex = Duplex || require__stream_duplex();
    if (!(this instanceof Readable))
      return new Readable(options);
    this._readableState = new ReadableState(options, this);
    this.readable = true;
    if (options) {
      if (typeof options.read === "function")
        this._read = options.read;
      if (typeof options.destroy === "function")
        this._destroy = options.destroy;
    }
    Stream.call(this);
  }
  Object.defineProperty(Readable.prototype, "destroyed", {
    get: function() {
      if (this._readableState === undefined) {
        return false;
      }
      return this._readableState.destroyed;
    },
    set: function(value) {
      if (!this._readableState) {
        return;
      }
      this._readableState.destroyed = value;
    }
  });
  Readable.prototype.destroy = destroyImpl.destroy;
  Readable.prototype._undestroy = destroyImpl.undestroy;
  Readable.prototype._destroy = function(err, cb) {
    this.push(null);
    cb(err);
  };
  Readable.prototype.push = function(chunk, encoding) {
    var state = this._readableState;
    var skipChunkCheck;
    if (!state.objectMode) {
      if (typeof chunk === "string") {
        encoding = encoding || state.defaultEncoding;
        if (encoding !== state.encoding) {
          chunk = Buffer2.from(chunk, encoding);
          encoding = "";
        }
        skipChunkCheck = true;
      }
    } else {
      skipChunkCheck = true;
    }
    return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
  };
  Readable.prototype.unshift = function(chunk) {
    return readableAddChunk(this, chunk, null, true, false);
  };
  function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
    var state = stream._readableState;
    if (chunk === null) {
      state.reading = false;
      onEofChunk(stream, state);
    } else {
      var er;
      if (!skipChunkCheck)
        er = chunkInvalid(state, chunk);
      if (er) {
        stream.emit("error", er);
      } else if (state.objectMode || chunk && chunk.length > 0) {
        if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
          chunk = _uint8ArrayToBuffer(chunk);
        }
        if (addToFront) {
          if (state.endEmitted)
            stream.emit("error", new Error("stream.unshift() after end event"));
          else
            addChunk(stream, state, chunk, true);
        } else if (state.ended) {
          stream.emit("error", new Error("stream.push() after EOF"));
        } else {
          state.reading = false;
          if (state.decoder && !encoding) {
            chunk = state.decoder.write(chunk);
            if (state.objectMode || chunk.length !== 0)
              addChunk(stream, state, chunk, false);
            else
              maybeReadMore(stream, state);
          } else {
            addChunk(stream, state, chunk, false);
          }
        }
      } else if (!addToFront) {
        state.reading = false;
      }
    }
    return needMoreData(state);
  }
  function addChunk(stream, state, chunk, addToFront) {
    if (state.flowing && state.length === 0 && !state.sync) {
      stream.emit("data", chunk);
      stream.read(0);
    } else {
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront)
        state.buffer.unshift(chunk);
      else
        state.buffer.push(chunk);
      if (state.needReadable)
        emitReadable(stream);
    }
    maybeReadMore(stream, state);
  }
  function chunkInvalid(state, chunk) {
    var er;
    if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== undefined && !state.objectMode) {
      er = new TypeError("Invalid non-string/buffer chunk");
    }
    return er;
  }
  function needMoreData(state) {
    return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
  }
  Readable.prototype.isPaused = function() {
    return this._readableState.flowing === false;
  };
  Readable.prototype.setEncoding = function(enc) {
    if (!StringDecoder)
      StringDecoder = require_string_decoder().StringDecoder;
    this._readableState.decoder = new StringDecoder(enc);
    this._readableState.encoding = enc;
    return this;
  };
  var MAX_HWM = 8388608;
  function computeNewHighWaterMark(n) {
    if (n >= MAX_HWM) {
      n = MAX_HWM;
    } else {
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }
  function howMuchToRead(n, state) {
    if (n <= 0 || state.length === 0 && state.ended)
      return 0;
    if (state.objectMode)
      return 1;
    if (n !== n) {
      if (state.flowing && state.length)
        return state.buffer.head.data.length;
      else
        return state.length;
    }
    if (n > state.highWaterMark)
      state.highWaterMark = computeNewHighWaterMark(n);
    if (n <= state.length)
      return n;
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    }
    return state.length;
  }
  Readable.prototype.read = function(n) {
    debug("read", n);
    n = parseInt(n, 10);
    var state = this._readableState;
    var nOrig = n;
    if (n !== 0)
      state.emittedReadable = false;
    if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
      debug("read: emitReadable", state.length, state.ended);
      if (state.length === 0 && state.ended)
        endReadable(this);
      else
        emitReadable(this);
      return null;
    }
    n = howMuchToRead(n, state);
    if (n === 0 && state.ended) {
      if (state.length === 0)
        endReadable(this);
      return null;
    }
    var doRead = state.needReadable;
    debug("need readable", doRead);
    if (state.length === 0 || state.length - n < state.highWaterMark) {
      doRead = true;
      debug("length less than watermark", doRead);
    }
    if (state.ended || state.reading) {
      doRead = false;
      debug("reading or ended", doRead);
    } else if (doRead) {
      debug("do read");
      state.reading = true;
      state.sync = true;
      if (state.length === 0)
        state.needReadable = true;
      this._read(state.highWaterMark);
      state.sync = false;
      if (!state.reading)
        n = howMuchToRead(nOrig, state);
    }
    var ret;
    if (n > 0)
      ret = fromList(n, state);
    else
      ret = null;
    if (ret === null) {
      state.needReadable = true;
      n = 0;
    } else {
      state.length -= n;
    }
    if (state.length === 0) {
      if (!state.ended)
        state.needReadable = true;
      if (nOrig !== n && state.ended)
        endReadable(this);
    }
    if (ret !== null)
      this.emit("data", ret);
    return ret;
  };
  function onEofChunk(stream, state) {
    if (state.ended)
      return;
    if (state.decoder) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) {
        state.buffer.push(chunk);
        state.length += state.objectMode ? 1 : chunk.length;
      }
    }
    state.ended = true;
    emitReadable(stream);
  }
  function emitReadable(stream) {
    var state = stream._readableState;
    state.needReadable = false;
    if (!state.emittedReadable) {
      debug("emitReadable", state.flowing);
      state.emittedReadable = true;
      if (state.sync)
        pna.nextTick(emitReadable_, stream);
      else
        emitReadable_(stream);
    }
  }
  function emitReadable_(stream) {
    debug("emit readable");
    stream.emit("readable");
    flow(stream);
  }
  function maybeReadMore(stream, state) {
    if (!state.readingMore) {
      state.readingMore = true;
      pna.nextTick(maybeReadMore_, stream, state);
    }
  }
  function maybeReadMore_(stream, state) {
    var len = state.length;
    while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
      debug("maybeReadMore read 0");
      stream.read(0);
      if (len === state.length)
        break;
      else
        len = state.length;
    }
    state.readingMore = false;
  }
  Readable.prototype._read = function(n) {
    this.emit("error", new Error("_read() is not implemented"));
  };
  Readable.prototype.pipe = function(dest, pipeOpts) {
    var src = this;
    var state = this._readableState;
    switch (state.pipesCount) {
      case 0:
        state.pipes = dest;
        break;
      case 1:
        state.pipes = [state.pipes, dest];
        break;
      default:
        state.pipes.push(dest);
        break;
    }
    state.pipesCount += 1;
    debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
    var endFn = doEnd ? onend : unpipe;
    if (state.endEmitted)
      pna.nextTick(endFn);
    else
      src.once("end", endFn);
    dest.on("unpipe", onunpipe);
    function onunpipe(readable, unpipeInfo) {
      debug("onunpipe");
      if (readable === src) {
        if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
          unpipeInfo.hasUnpiped = true;
          cleanup();
        }
      }
    }
    function onend() {
      debug("onend");
      dest.end();
    }
    var ondrain = pipeOnDrain(src);
    dest.on("drain", ondrain);
    var cleanedUp = false;
    function cleanup() {
      debug("cleanup");
      dest.removeListener("close", onclose);
      dest.removeListener("finish", onfinish);
      dest.removeListener("drain", ondrain);
      dest.removeListener("error", onerror);
      dest.removeListener("unpipe", onunpipe);
      src.removeListener("end", onend);
      src.removeListener("end", unpipe);
      src.removeListener("data", ondata);
      cleanedUp = true;
      if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain))
        ondrain();
    }
    var increasedAwaitDrain = false;
    src.on("data", ondata);
    function ondata(chunk) {
      debug("ondata");
      increasedAwaitDrain = false;
      var ret = dest.write(chunk);
      if (ret === false && !increasedAwaitDrain) {
        if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
          debug("false write response, pause", state.awaitDrain);
          state.awaitDrain++;
          increasedAwaitDrain = true;
        }
        src.pause();
      }
    }
    function onerror(er) {
      debug("onerror", er);
      unpipe();
      dest.removeListener("error", onerror);
      if (EElistenerCount(dest, "error") === 0)
        dest.emit("error", er);
    }
    prependListener(dest, "error", onerror);
    function onclose() {
      dest.removeListener("finish", onfinish);
      unpipe();
    }
    dest.once("close", onclose);
    function onfinish() {
      debug("onfinish");
      dest.removeListener("close", onclose);
      unpipe();
    }
    dest.once("finish", onfinish);
    function unpipe() {
      debug("unpipe");
      src.unpipe(dest);
    }
    dest.emit("pipe", src);
    if (!state.flowing) {
      debug("pipe resume");
      src.resume();
    }
    return dest;
  };
  function pipeOnDrain(src) {
    return function() {
      var state = src._readableState;
      debug("pipeOnDrain", state.awaitDrain);
      if (state.awaitDrain)
        state.awaitDrain--;
      if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
        state.flowing = true;
        flow(src);
      }
    };
  }
  Readable.prototype.unpipe = function(dest) {
    var state = this._readableState;
    var unpipeInfo = { hasUnpiped: false };
    if (state.pipesCount === 0)
      return this;
    if (state.pipesCount === 1) {
      if (dest && dest !== state.pipes)
        return this;
      if (!dest)
        dest = state.pipes;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      if (dest)
        dest.emit("unpipe", this, unpipeInfo);
      return this;
    }
    if (!dest) {
      var dests = state.pipes;
      var len = state.pipesCount;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      for (var i = 0;i < len; i++) {
        dests[i].emit("unpipe", this, { hasUnpiped: false });
      }
      return this;
    }
    var index = indexOf(state.pipes, dest);
    if (index === -1)
      return this;
    state.pipes.splice(index, 1);
    state.pipesCount -= 1;
    if (state.pipesCount === 1)
      state.pipes = state.pipes[0];
    dest.emit("unpipe", this, unpipeInfo);
    return this;
  };
  Readable.prototype.on = function(ev, fn) {
    var res = Stream.prototype.on.call(this, ev, fn);
    if (ev === "data") {
      if (this._readableState.flowing !== false)
        this.resume();
    } else if (ev === "readable") {
      var state = this._readableState;
      if (!state.endEmitted && !state.readableListening) {
        state.readableListening = state.needReadable = true;
        state.emittedReadable = false;
        if (!state.reading) {
          pna.nextTick(nReadingNextTick, this);
        } else if (state.length) {
          emitReadable(this);
        }
      }
    }
    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;
  function nReadingNextTick(self2) {
    debug("readable nexttick read 0");
    self2.read(0);
  }
  Readable.prototype.resume = function() {
    var state = this._readableState;
    if (!state.flowing) {
      debug("resume");
      state.flowing = true;
      resume(this, state);
    }
    return this;
  };
  function resume(stream, state) {
    if (!state.resumeScheduled) {
      state.resumeScheduled = true;
      pna.nextTick(resume_, stream, state);
    }
  }
  function resume_(stream, state) {
    if (!state.reading) {
      debug("resume read 0");
      stream.read(0);
    }
    state.resumeScheduled = false;
    state.awaitDrain = 0;
    stream.emit("resume");
    flow(stream);
    if (state.flowing && !state.reading)
      stream.read(0);
  }
  Readable.prototype.pause = function() {
    debug("call pause flowing=%j", this._readableState.flowing);
    if (this._readableState.flowing !== false) {
      debug("pause");
      this._readableState.flowing = false;
      this.emit("pause");
    }
    return this;
  };
  function flow(stream) {
    var state = stream._readableState;
    debug("flow", state.flowing);
    while (state.flowing && stream.read() !== null) {}
  }
  Readable.prototype.wrap = function(stream) {
    var _this = this;
    var state = this._readableState;
    var paused = false;
    stream.on("end", function() {
      debug("wrapped end");
      if (state.decoder && !state.ended) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length)
          _this.push(chunk);
      }
      _this.push(null);
    });
    stream.on("data", function(chunk) {
      debug("wrapped data");
      if (state.decoder)
        chunk = state.decoder.write(chunk);
      if (state.objectMode && (chunk === null || chunk === undefined))
        return;
      else if (!state.objectMode && (!chunk || !chunk.length))
        return;
      var ret = _this.push(chunk);
      if (!ret) {
        paused = true;
        stream.pause();
      }
    });
    for (var i in stream) {
      if (this[i] === undefined && typeof stream[i] === "function") {
        this[i] = function(method) {
          return function() {
            return stream[method].apply(stream, arguments);
          };
        }(i);
      }
    }
    for (var n = 0;n < kProxyEvents.length; n++) {
      stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
    }
    this._read = function(n2) {
      debug("wrapped _read", n2);
      if (paused) {
        paused = false;
        stream.resume();
      }
    };
    return this;
  };
  Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
    enumerable: false,
    get: function() {
      return this._readableState.highWaterMark;
    }
  });
  Readable._fromList = fromList;
  function fromList(n, state) {
    if (state.length === 0)
      return null;
    var ret;
    if (state.objectMode)
      ret = state.buffer.shift();
    else if (!n || n >= state.length) {
      if (state.decoder)
        ret = state.buffer.join("");
      else if (state.buffer.length === 1)
        ret = state.buffer.head.data;
      else
        ret = state.buffer.concat(state.length);
      state.buffer.clear();
    } else {
      ret = fromListPartial(n, state.buffer, state.decoder);
    }
    return ret;
  }
  function fromListPartial(n, list, hasStrings) {
    var ret;
    if (n < list.head.data.length) {
      ret = list.head.data.slice(0, n);
      list.head.data = list.head.data.slice(n);
    } else if (n === list.head.data.length) {
      ret = list.shift();
    } else {
      ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
    }
    return ret;
  }
  function copyFromBufferString(n, list) {
    var p = list.head;
    var c = 1;
    var ret = p.data;
    n -= ret.length;
    while (p = p.next) {
      var str = p.data;
      var nb = n > str.length ? str.length : n;
      if (nb === str.length)
        ret += str;
      else
        ret += str.slice(0, n);
      n -= nb;
      if (n === 0) {
        if (nb === str.length) {
          ++c;
          if (p.next)
            list.head = p.next;
          else
            list.head = list.tail = null;
        } else {
          list.head = p;
          p.data = str.slice(nb);
        }
        break;
      }
      ++c;
    }
    list.length -= c;
    return ret;
  }
  function copyFromBuffer(n, list) {
    var ret = Buffer2.allocUnsafe(n);
    var p = list.head;
    var c = 1;
    p.data.copy(ret);
    n -= p.data.length;
    while (p = p.next) {
      var buf = p.data;
      var nb = n > buf.length ? buf.length : n;
      buf.copy(ret, ret.length - n, 0, nb);
      n -= nb;
      if (n === 0) {
        if (nb === buf.length) {
          ++c;
          if (p.next)
            list.head = p.next;
          else
            list.head = list.tail = null;
        } else {
          list.head = p;
          p.data = buf.slice(nb);
        }
        break;
      }
      ++c;
    }
    list.length -= c;
    return ret;
  }
  function endReadable(stream) {
    var state = stream._readableState;
    if (state.length > 0)
      throw new Error('"endReadable()" called on non-empty stream');
    if (!state.endEmitted) {
      state.ended = true;
      pna.nextTick(endReadableNT, state, stream);
    }
  }
  function endReadableNT(state, stream) {
    if (!state.endEmitted && state.length === 0) {
      state.endEmitted = true;
      stream.readable = false;
      stream.emit("end");
    }
  }
  function indexOf(xs, x) {
    for (var i = 0, l = xs.length;i < l; i++) {
      if (xs[i] === x)
        return i;
    }
    return -1;
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_transform.js
var require__stream_transform = __commonJS((exports, module) => {
  module.exports = Transform;
  var Duplex = require__stream_duplex();
  var util = Object.create(require_util());
  util.inherits = require_inherits();
  util.inherits(Transform, Duplex);
  function afterTransform(er, data) {
    var ts = this._transformState;
    ts.transforming = false;
    var cb = ts.writecb;
    if (!cb) {
      return this.emit("error", new Error("write callback called multiple times"));
    }
    ts.writechunk = null;
    ts.writecb = null;
    if (data != null)
      this.push(data);
    cb(er);
    var rs = this._readableState;
    rs.reading = false;
    if (rs.needReadable || rs.length < rs.highWaterMark) {
      this._read(rs.highWaterMark);
    }
  }
  function Transform(options) {
    if (!(this instanceof Transform))
      return new Transform(options);
    Duplex.call(this, options);
    this._transformState = {
      afterTransform: afterTransform.bind(this),
      needTransform: false,
      transforming: false,
      writecb: null,
      writechunk: null,
      writeencoding: null
    };
    this._readableState.needReadable = true;
    this._readableState.sync = false;
    if (options) {
      if (typeof options.transform === "function")
        this._transform = options.transform;
      if (typeof options.flush === "function")
        this._flush = options.flush;
    }
    this.on("prefinish", prefinish);
  }
  function prefinish() {
    var _this = this;
    if (typeof this._flush === "function") {
      this._flush(function(er, data) {
        done(_this, er, data);
      });
    } else {
      done(this, null, null);
    }
  }
  Transform.prototype.push = function(chunk, encoding) {
    this._transformState.needTransform = false;
    return Duplex.prototype.push.call(this, chunk, encoding);
  };
  Transform.prototype._transform = function(chunk, encoding, cb) {
    throw new Error("_transform() is not implemented");
  };
  Transform.prototype._write = function(chunk, encoding, cb) {
    var ts = this._transformState;
    ts.writecb = cb;
    ts.writechunk = chunk;
    ts.writeencoding = encoding;
    if (!ts.transforming) {
      var rs = this._readableState;
      if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark)
        this._read(rs.highWaterMark);
    }
  };
  Transform.prototype._read = function(n) {
    var ts = this._transformState;
    if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
      ts.transforming = true;
      this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
    } else {
      ts.needTransform = true;
    }
  };
  Transform.prototype._destroy = function(err, cb) {
    var _this2 = this;
    Duplex.prototype._destroy.call(this, err, function(err2) {
      cb(err2);
      _this2.emit("close");
    });
  };
  function done(stream, er, data) {
    if (er)
      return stream.emit("error", er);
    if (data != null)
      stream.push(data);
    if (stream._writableState.length)
      throw new Error("Calling transform done when ws.length != 0");
    if (stream._transformState.transforming)
      throw new Error("Calling transform done when still transforming");
    return stream.push(null);
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/lib/_stream_passthrough.js
var require__stream_passthrough = __commonJS((exports, module) => {
  module.exports = PassThrough;
  var Transform = require__stream_transform();
  var util = Object.create(require_util());
  util.inherits = require_inherits();
  util.inherits(PassThrough, Transform);
  function PassThrough(options) {
    if (!(this instanceof PassThrough))
      return new PassThrough(options);
    Transform.call(this, options);
  }
  PassThrough.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
  };
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/readable.js
var require_readable = __commonJS((exports, module) => {
  var Stream = __require("stream");
  if (process.env.READABLE_STREAM === "disable" && Stream) {
    module.exports = Stream;
    exports = module.exports = Stream.Readable;
    exports.Readable = Stream.Readable;
    exports.Writable = Stream.Writable;
    exports.Duplex = Stream.Duplex;
    exports.Transform = Stream.Transform;
    exports.PassThrough = Stream.PassThrough;
    exports.Stream = Stream;
  } else {
    exports = module.exports = require__stream_readable();
    exports.Stream = Stream || exports;
    exports.Readable = exports;
    exports.Writable = require__stream_writable();
    exports.Duplex = require__stream_duplex();
    exports.Transform = require__stream_transform();
    exports.PassThrough = require__stream_passthrough();
  }
});

// ../../node_modules/.pnpm/readable-stream@2.3.8/node_modules/readable-stream/passthrough.js
var require_passthrough = __commonJS((exports, module) => {
  module.exports = require_readable().PassThrough;
});

// ../../node_modules/.pnpm/lazystream@1.0.1/node_modules/lazystream/lib/lazystream.js
var require_lazystream = __commonJS((exports, module) => {
  var util = __require("util");
  var PassThrough = require_passthrough();
  module.exports = {
    Readable,
    Writable
  };
  util.inherits(Readable, PassThrough);
  util.inherits(Writable, PassThrough);
  function beforeFirstCall(instance, method, callback) {
    instance[method] = function() {
      delete instance[method];
      callback.apply(this, arguments);
      return this[method].apply(this, arguments);
    };
  }
  function Readable(fn, options) {
    if (!(this instanceof Readable))
      return new Readable(fn, options);
    PassThrough.call(this, options);
    beforeFirstCall(this, "_read", function() {
      var source = fn.call(this, options);
      var emit = this.emit.bind(this, "error");
      source.on("error", emit);
      source.pipe(this);
    });
    this.emit("readable");
  }
  function Writable(fn, options) {
    if (!(this instanceof Writable))
      return new Writable(fn, options);
    PassThrough.call(this, options);
    beforeFirstCall(this, "_write", function() {
      var destination = fn.call(this, options);
      var emit = this.emit.bind(this, "error");
      destination.on("error", emit);
      this.pipe(destination);
    });
    this.emit("writable");
  }
});

// ../../node_modules/.pnpm/normalize-path@3.0.0/node_modules/normalize-path/index.js
var require_normalize_path = __commonJS((exports, module) => {
  /*!
   * normalize-path <https://github.com/jonschlinkert/normalize-path>
   *
   * Copyright (c) 2014-2018, Jon Schlinkert.
   * Released under the MIT License.
   */
  module.exports = function(path, stripTrailing) {
    if (typeof path !== "string") {
      throw new TypeError("expected path to be a string");
    }
    if (path === "\\" || path === "/")
      return "/";
    var len = path.length;
    if (len <= 1)
      return path;
    var prefix = "";
    if (len > 4 && path[3] === "\\") {
      var ch = path[2];
      if ((ch === "?" || ch === ".") && path.slice(0, 2) === "\\\\") {
        path = path.slice(2);
        prefix = "//";
      }
    }
    var segs = path.split(/[/\\]+/);
    if (stripTrailing !== false && segs[segs.length - 1] === "") {
      segs.pop();
    }
    return prefix + segs.join("/");
  };
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/identity.js
var require_identity = __commonJS((exports, module) => {
  function identity(value) {
    return value;
  }
  module.exports = identity;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_apply.js
var require__apply = __commonJS((exports, module) => {
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0:
        return func.call(thisArg);
      case 1:
        return func.call(thisArg, args[0]);
      case 2:
        return func.call(thisArg, args[0], args[1]);
      case 3:
        return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }
  module.exports = apply;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_overRest.js
var require__overRest = __commonJS((exports, module) => {
  var apply = require__apply();
  var nativeMax = Math.max;
  function overRest(func, start, transform) {
    start = nativeMax(start === undefined ? func.length - 1 : start, 0);
    return function() {
      var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform(array);
      return apply(func, this, otherArgs);
    };
  }
  module.exports = overRest;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/constant.js
var require_constant = __commonJS((exports, module) => {
  function constant(value) {
    return function() {
      return value;
    };
  }
  module.exports = constant;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_freeGlobal.js
var require__freeGlobal = __commonJS((exports, module) => {
  var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  module.exports = freeGlobal;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_root.js
var require__root = __commonJS((exports, module) => {
  var freeGlobal = require__freeGlobal();
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function("return this")();
  module.exports = root;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Symbol.js
var require__Symbol = __commonJS((exports, module) => {
  var root = require__root();
  var Symbol2 = root.Symbol;
  module.exports = Symbol2;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getRawTag.js
var require__getRawTag = __commonJS((exports, module) => {
  var Symbol2 = require__Symbol();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var nativeObjectToString = objectProto.toString;
  var symToStringTag = Symbol2 ? Symbol2.toStringTag : undefined;
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  module.exports = getRawTag;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_objectToString.js
var require__objectToString = __commonJS((exports, module) => {
  var objectProto = Object.prototype;
  var nativeObjectToString = objectProto.toString;
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }
  module.exports = objectToString;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGetTag.js
var require__baseGetTag = __commonJS((exports, module) => {
  var Symbol2 = require__Symbol();
  var getRawTag = require__getRawTag();
  var objectToString = require__objectToString();
  var nullTag = "[object Null]";
  var undefinedTag = "[object Undefined]";
  var symToStringTag = Symbol2 ? Symbol2.toStringTag : undefined;
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
  }
  module.exports = baseGetTag;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isObject.js
var require_isObject = __commonJS((exports, module) => {
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  module.exports = isObject;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isFunction.js
var require_isFunction = __commonJS((exports, module) => {
  var baseGetTag = require__baseGetTag();
  var isObject = require_isObject();
  var asyncTag = "[object AsyncFunction]";
  var funcTag = "[object Function]";
  var genTag = "[object GeneratorFunction]";
  var proxyTag = "[object Proxy]";
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }
  module.exports = isFunction;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_coreJsData.js
var require__coreJsData = __commonJS((exports, module) => {
  var root = require__root();
  var coreJsData = root["__core-js_shared__"];
  module.exports = coreJsData;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isMasked.js
var require__isMasked = __commonJS((exports, module) => {
  var coreJsData = require__coreJsData();
  var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  }();
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  module.exports = isMasked;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_toSource.js
var require__toSource = __commonJS((exports, module) => {
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return func + "";
      } catch (e) {}
    }
    return "";
  }
  module.exports = toSource;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsNative.js
var require__baseIsNative = __commonJS((exports, module) => {
  var isFunction = require_isFunction();
  var isMasked = require__isMasked();
  var isObject = require_isObject();
  var toSource = require__toSource();
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var funcProto = Function.prototype;
  var objectProto = Object.prototype;
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  module.exports = baseIsNative;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getValue.js
var require__getValue = __commonJS((exports, module) => {
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }
  module.exports = getValue;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getNative.js
var require__getNative = __commonJS((exports, module) => {
  var baseIsNative = require__baseIsNative();
  var getValue = require__getValue();
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }
  module.exports = getNative;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_defineProperty.js
var require__defineProperty = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var defineProperty = function() {
    try {
      var func = getNative(Object, "defineProperty");
      func({}, "", {});
      return func;
    } catch (e) {}
  }();
  module.exports = defineProperty;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSetToString.js
var require__baseSetToString = __commonJS((exports, module) => {
  var constant = require_constant();
  var defineProperty = require__defineProperty();
  var identity = require_identity();
  var baseSetToString = !defineProperty ? identity : function(func, string) {
    return defineProperty(func, "toString", {
      configurable: true,
      enumerable: false,
      value: constant(string),
      writable: true
    });
  };
  module.exports = baseSetToString;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_shortOut.js
var require__shortOut = __commonJS((exports, module) => {
  var HOT_COUNT = 800;
  var HOT_SPAN = 16;
  var nativeNow = Date.now;
  function shortOut(func) {
    var count = 0, lastCalled = 0;
    return function() {
      var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(undefined, arguments);
    };
  }
  module.exports = shortOut;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setToString.js
var require__setToString = __commonJS((exports, module) => {
  var baseSetToString = require__baseSetToString();
  var shortOut = require__shortOut();
  var setToString = shortOut(baseSetToString);
  module.exports = setToString;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseRest.js
var require__baseRest = __commonJS((exports, module) => {
  var identity = require_identity();
  var overRest = require__overRest();
  var setToString = require__setToString();
  function baseRest(func, start) {
    return setToString(overRest(func, start, identity), func + "");
  }
  module.exports = baseRest;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/eq.js
var require_eq = __commonJS((exports, module) => {
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  module.exports = eq;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isLength.js
var require_isLength = __commonJS((exports, module) => {
  var MAX_SAFE_INTEGER = 9007199254740991;
  function isLength(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }
  module.exports = isLength;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArrayLike.js
var require_isArrayLike = __commonJS((exports, module) => {
  var isFunction = require_isFunction();
  var isLength = require_isLength();
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }
  module.exports = isArrayLike;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isIndex.js
var require__isIndex = __commonJS((exports, module) => {
  var MAX_SAFE_INTEGER = 9007199254740991;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  module.exports = isIndex;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isIterateeCall.js
var require__isIterateeCall = __commonJS((exports, module) => {
  var eq = require_eq();
  var isArrayLike = require_isArrayLike();
  var isIndex = require__isIndex();
  var isObject = require_isObject();
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && (index in object)) {
      return eq(object[index], value);
    }
    return false;
  }
  module.exports = isIterateeCall;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseTimes.js
var require__baseTimes = __commonJS((exports, module) => {
  function baseTimes(n, iteratee) {
    var index = -1, result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  module.exports = baseTimes;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isObjectLike.js
var require_isObjectLike = __commonJS((exports, module) => {
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  module.exports = isObjectLike;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsArguments.js
var require__baseIsArguments = __commonJS((exports, module) => {
  var baseGetTag = require__baseGetTag();
  var isObjectLike = require_isObjectLike();
  var argsTag = "[object Arguments]";
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }
  module.exports = baseIsArguments;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArguments.js
var require_isArguments = __commonJS((exports, module) => {
  var baseIsArguments = require__baseIsArguments();
  var isObjectLike = require_isObjectLike();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var isArguments = baseIsArguments(function() {
    return arguments;
  }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
  };
  module.exports = isArguments;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArray.js
var require_isArray = __commonJS((exports, module) => {
  var isArray = Array.isArray;
  module.exports = isArray;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/stubFalse.js
var require_stubFalse = __commonJS((exports, module) => {
  function stubFalse() {
    return false;
  }
  module.exports = stubFalse;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isBuffer.js
var require_isBuffer = __commonJS((exports, module) => {
  var root = require__root();
  var stubFalse = require_stubFalse();
  var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer2 = moduleExports ? root.Buffer : undefined;
  var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : undefined;
  var isBuffer = nativeIsBuffer || stubFalse;
  module.exports = isBuffer;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsTypedArray.js
var require__baseIsTypedArray = __commonJS((exports, module) => {
  var baseGetTag = require__baseGetTag();
  var isLength = require_isLength();
  var isObjectLike = require_isObjectLike();
  var argsTag = "[object Arguments]";
  var arrayTag = "[object Array]";
  var boolTag = "[object Boolean]";
  var dateTag = "[object Date]";
  var errorTag = "[object Error]";
  var funcTag = "[object Function]";
  var mapTag = "[object Map]";
  var numberTag = "[object Number]";
  var objectTag = "[object Object]";
  var regexpTag = "[object RegExp]";
  var setTag = "[object Set]";
  var stringTag = "[object String]";
  var weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]";
  var dataViewTag = "[object DataView]";
  var float32Tag = "[object Float32Array]";
  var float64Tag = "[object Float64Array]";
  var int8Tag = "[object Int8Array]";
  var int16Tag = "[object Int16Array]";
  var int32Tag = "[object Int32Array]";
  var uint8Tag = "[object Uint8Array]";
  var uint8ClampedTag = "[object Uint8ClampedArray]";
  var uint16Tag = "[object Uint16Array]";
  var uint32Tag = "[object Uint32Array]";
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }
  module.exports = baseIsTypedArray;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseUnary.js
var require__baseUnary = __commonJS((exports, module) => {
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  module.exports = baseUnary;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nodeUtil.js
var require__nodeUtil = __commonJS((exports, module) => {
  var freeGlobal = require__freeGlobal();
  var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var freeProcess = moduleExports && freeGlobal.process;
  var nodeUtil = function() {
    try {
      var types = freeModule && freeModule.require && freeModule.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {}
  }();
  module.exports = nodeUtil;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isTypedArray.js
var require_isTypedArray = __commonJS((exports, module) => {
  var baseIsTypedArray = require__baseIsTypedArray();
  var baseUnary = require__baseUnary();
  var nodeUtil = require__nodeUtil();
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
  module.exports = isTypedArray;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayLikeKeys.js
var require__arrayLikeKeys = __commonJS((exports, module) => {
  var baseTimes = require__baseTimes();
  var isArguments = require_isArguments();
  var isArray = require_isArray();
  var isBuffer = require_isBuffer();
  var isIndex = require__isIndex();
  var isTypedArray = require_isTypedArray();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
    for (var key in value) {
      if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || isIndex(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }
  module.exports = arrayLikeKeys;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isPrototype.js
var require__isPrototype = __commonJS((exports, module) => {
  var objectProto = Object.prototype;
  function isPrototype(value) {
    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
    return value === proto;
  }
  module.exports = isPrototype;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeKeysIn.js
var require__nativeKeysIn = __commonJS((exports, module) => {
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }
  module.exports = nativeKeysIn;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseKeysIn.js
var require__baseKeysIn = __commonJS((exports, module) => {
  var isObject = require_isObject();
  var isPrototype = require__isPrototype();
  var nativeKeysIn = require__nativeKeysIn();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseKeysIn(object) {
    if (!isObject(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype(object), result = [];
    for (var key in object) {
      if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }
  module.exports = baseKeysIn;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/keysIn.js
var require_keysIn = __commonJS((exports, module) => {
  var arrayLikeKeys = require__arrayLikeKeys();
  var baseKeysIn = require__baseKeysIn();
  var isArrayLike = require_isArrayLike();
  function keysIn(object) {
    return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
  }
  module.exports = keysIn;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/defaults.js
var require_defaults = __commonJS((exports, module) => {
  var baseRest = require__baseRest();
  var eq = require_eq();
  var isIterateeCall = require__isIterateeCall();
  var keysIn = require_keysIn();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var defaults = baseRest(function(object, sources) {
    object = Object(object);
    var index = -1;
    var length = sources.length;
    var guard = length > 2 ? sources[2] : undefined;
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      length = 1;
    }
    while (++index < length) {
      var source = sources[index];
      var props = keysIn(source);
      var propsIndex = -1;
      var propsLength = props.length;
      while (++propsIndex < propsLength) {
        var key = props[propsIndex];
        var value = object[key];
        if (value === undefined || eq(value, objectProto[key]) && !hasOwnProperty.call(object, key)) {
          object[key] = source[key];
        }
      }
    }
    return object;
  });
  module.exports = defaults;
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/ours/primordials.js
var require_primordials = __commonJS((exports, module) => {
  class AggregateError extends Error {
    constructor(errors) {
      if (!Array.isArray(errors)) {
        throw new TypeError(`Expected input to be an Array, got ${typeof errors}`);
      }
      let message = "";
      for (let i = 0;i < errors.length; i++) {
        message += `    ${errors[i].stack}
`;
      }
      super(message);
      this.name = "AggregateError";
      this.errors = errors;
    }
  }
  module.exports = {
    AggregateError,
    ArrayIsArray(self2) {
      return Array.isArray(self2);
    },
    ArrayPrototypeIncludes(self2, el) {
      return self2.includes(el);
    },
    ArrayPrototypeIndexOf(self2, el) {
      return self2.indexOf(el);
    },
    ArrayPrototypeJoin(self2, sep) {
      return self2.join(sep);
    },
    ArrayPrototypeMap(self2, fn) {
      return self2.map(fn);
    },
    ArrayPrototypePop(self2, el) {
      return self2.pop(el);
    },
    ArrayPrototypePush(self2, el) {
      return self2.push(el);
    },
    ArrayPrototypeSlice(self2, start, end) {
      return self2.slice(start, end);
    },
    Error,
    FunctionPrototypeCall(fn, thisArgs, ...args) {
      return fn.call(thisArgs, ...args);
    },
    FunctionPrototypeSymbolHasInstance(self2, instance) {
      return Function.prototype[Symbol.hasInstance].call(self2, instance);
    },
    MathFloor: Math.floor,
    Number,
    NumberIsInteger: Number.isInteger,
    NumberIsNaN: Number.isNaN,
    NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
    NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
    NumberParseInt: Number.parseInt,
    ObjectDefineProperties(self2, props) {
      return Object.defineProperties(self2, props);
    },
    ObjectDefineProperty(self2, name, prop) {
      return Object.defineProperty(self2, name, prop);
    },
    ObjectGetOwnPropertyDescriptor(self2, name) {
      return Object.getOwnPropertyDescriptor(self2, name);
    },
    ObjectKeys(obj) {
      return Object.keys(obj);
    },
    ObjectSetPrototypeOf(target, proto) {
      return Object.setPrototypeOf(target, proto);
    },
    Promise,
    PromisePrototypeCatch(self2, fn) {
      return self2.catch(fn);
    },
    PromisePrototypeThen(self2, thenFn, catchFn) {
      return self2.then(thenFn, catchFn);
    },
    PromiseReject(err) {
      return Promise.reject(err);
    },
    PromiseResolve(val) {
      return Promise.resolve(val);
    },
    ReflectApply: Reflect.apply,
    RegExpPrototypeTest(self2, value) {
      return self2.test(value);
    },
    SafeSet: Set,
    String,
    StringPrototypeSlice(self2, start, end) {
      return self2.slice(start, end);
    },
    StringPrototypeToLowerCase(self2) {
      return self2.toLowerCase();
    },
    StringPrototypeToUpperCase(self2) {
      return self2.toUpperCase();
    },
    StringPrototypeTrim(self2) {
      return self2.trim();
    },
    Symbol,
    SymbolFor: Symbol.for,
    SymbolAsyncIterator: Symbol.asyncIterator,
    SymbolHasInstance: Symbol.hasInstance,
    SymbolIterator: Symbol.iterator,
    SymbolDispose: Symbol.dispose || Symbol("Symbol.dispose"),
    SymbolAsyncDispose: Symbol.asyncDispose || Symbol("Symbol.asyncDispose"),
    TypedArrayPrototypeSet(self2, buf, len) {
      return self2.set(buf, len);
    },
    Boolean,
    Uint8Array
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/ours/util/inspect.js
var require_inspect = __commonJS((exports, module) => {
  module.exports = {
    format(format, ...args) {
      return format.replace(/%([sdifj])/g, function(...[_unused, type]) {
        const replacement = args.shift();
        if (type === "f") {
          return replacement.toFixed(6);
        } else if (type === "j") {
          return JSON.stringify(replacement);
        } else if (type === "s" && typeof replacement === "object") {
          const ctor = replacement.constructor !== Object ? replacement.constructor.name : "";
          return `${ctor} {}`.trim();
        } else {
          return replacement.toString();
        }
      });
    },
    inspect(value) {
      switch (typeof value) {
        case "string":
          if (value.includes("'")) {
            if (!value.includes('"')) {
              return `"${value}"`;
            } else if (!value.includes("`") && !value.includes("${")) {
              return `\`${value}\``;
            }
          }
          return `'${value}'`;
        case "number":
          if (isNaN(value)) {
            return "NaN";
          } else if (Object.is(value, -0)) {
            return String(value);
          }
          return value;
        case "bigint":
          return `${String(value)}n`;
        case "boolean":
        case "undefined":
          return String(value);
        case "object":
          return "{}";
      }
    }
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/ours/errors.js
var require_errors = __commonJS((exports, module) => {
  var { format, inspect } = require_inspect();
  var { AggregateError: CustomAggregateError } = require_primordials();
  var AggregateError = globalThis.AggregateError || CustomAggregateError;
  var kIsNodeError = Symbol("kIsNodeError");
  var kTypes = [
    "string",
    "function",
    "number",
    "object",
    "Function",
    "Object",
    "boolean",
    "bigint",
    "symbol"
  ];
  var classRegExp = /^([A-Z][a-z0-9]*)+$/;
  var nodeInternalPrefix = "__node_internal_";
  var codes = {};
  function assert(value, message) {
    if (!value) {
      throw new codes.ERR_INTERNAL_ASSERTION(message);
    }
  }
  function addNumericalSeparator(val) {
    let res = "";
    let i = val.length;
    const start = val[0] === "-" ? 1 : 0;
    for (;i >= start + 4; i -= 3) {
      res = `_${val.slice(i - 3, i)}${res}`;
    }
    return `${val.slice(0, i)}${res}`;
  }
  function getMessage(key, msg, args) {
    if (typeof msg === "function") {
      assert(msg.length <= args.length, `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${msg.length}).`);
      return msg(...args);
    }
    const expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
    assert(expectedLength === args.length, `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${expectedLength}).`);
    if (args.length === 0) {
      return msg;
    }
    return format(msg, ...args);
  }
  function E(code, message, Base) {
    if (!Base) {
      Base = Error;
    }

    class NodeError extends Base {
      constructor(...args) {
        super(getMessage(code, message, args));
      }
      toString() {
        return `${this.name} [${code}]: ${this.message}`;
      }
    }
    Object.defineProperties(NodeError.prototype, {
      name: {
        value: Base.name,
        writable: true,
        enumerable: false,
        configurable: true
      },
      toString: {
        value() {
          return `${this.name} [${code}]: ${this.message}`;
        },
        writable: true,
        enumerable: false,
        configurable: true
      }
    });
    NodeError.prototype.code = code;
    NodeError.prototype[kIsNodeError] = true;
    codes[code] = NodeError;
  }
  function hideStackFrames(fn) {
    const hidden = nodeInternalPrefix + fn.name;
    Object.defineProperty(fn, "name", {
      value: hidden
    });
    return fn;
  }
  function aggregateTwoErrors(innerError, outerError) {
    if (innerError && outerError && innerError !== outerError) {
      if (Array.isArray(outerError.errors)) {
        outerError.errors.push(innerError);
        return outerError;
      }
      const err = new AggregateError([outerError, innerError], outerError.message);
      err.code = outerError.code;
      return err;
    }
    return innerError || outerError;
  }

  class AbortError extends Error {
    constructor(message = "The operation was aborted", options = undefined) {
      if (options !== undefined && typeof options !== "object") {
        throw new codes.ERR_INVALID_ARG_TYPE("options", "Object", options);
      }
      super(message, options);
      this.code = "ABORT_ERR";
      this.name = "AbortError";
    }
  }
  E("ERR_ASSERTION", "%s", Error);
  E("ERR_INVALID_ARG_TYPE", (name, expected, actual) => {
    assert(typeof name === "string", "'name' must be a string");
    if (!Array.isArray(expected)) {
      expected = [expected];
    }
    let msg = "The ";
    if (name.endsWith(" argument")) {
      msg += `${name} `;
    } else {
      msg += `"${name}" ${name.includes(".") ? "property" : "argument"} `;
    }
    msg += "must be ";
    const types = [];
    const instances = [];
    const other = [];
    for (const value of expected) {
      assert(typeof value === "string", "All expected entries have to be of type string");
      if (kTypes.includes(value)) {
        types.push(value.toLowerCase());
      } else if (classRegExp.test(value)) {
        instances.push(value);
      } else {
        assert(value !== "object", 'The value "object" should be written as "Object"');
        other.push(value);
      }
    }
    if (instances.length > 0) {
      const pos = types.indexOf("object");
      if (pos !== -1) {
        types.splice(types, pos, 1);
        instances.push("Object");
      }
    }
    if (types.length > 0) {
      switch (types.length) {
        case 1:
          msg += `of type ${types[0]}`;
          break;
        case 2:
          msg += `one of type ${types[0]} or ${types[1]}`;
          break;
        default: {
          const last = types.pop();
          msg += `one of type ${types.join(", ")}, or ${last}`;
        }
      }
      if (instances.length > 0 || other.length > 0) {
        msg += " or ";
      }
    }
    if (instances.length > 0) {
      switch (instances.length) {
        case 1:
          msg += `an instance of ${instances[0]}`;
          break;
        case 2:
          msg += `an instance of ${instances[0]} or ${instances[1]}`;
          break;
        default: {
          const last = instances.pop();
          msg += `an instance of ${instances.join(", ")}, or ${last}`;
        }
      }
      if (other.length > 0) {
        msg += " or ";
      }
    }
    switch (other.length) {
      case 0:
        break;
      case 1:
        if (other[0].toLowerCase() !== other[0]) {
          msg += "an ";
        }
        msg += `${other[0]}`;
        break;
      case 2:
        msg += `one of ${other[0]} or ${other[1]}`;
        break;
      default: {
        const last = other.pop();
        msg += `one of ${other.join(", ")}, or ${last}`;
      }
    }
    if (actual == null) {
      msg += `. Received ${actual}`;
    } else if (typeof actual === "function" && actual.name) {
      msg += `. Received function ${actual.name}`;
    } else if (typeof actual === "object") {
      var _actual$constructor;
      if ((_actual$constructor = actual.constructor) !== null && _actual$constructor !== undefined && _actual$constructor.name) {
        msg += `. Received an instance of ${actual.constructor.name}`;
      } else {
        const inspected = inspect(actual, {
          depth: -1
        });
        msg += `. Received ${inspected}`;
      }
    } else {
      let inspected = inspect(actual, {
        colors: false
      });
      if (inspected.length > 25) {
        inspected = `${inspected.slice(0, 25)}...`;
      }
      msg += `. Received type ${typeof actual} (${inspected})`;
    }
    return msg;
  }, TypeError);
  E("ERR_INVALID_ARG_VALUE", (name, value, reason = "is invalid") => {
    let inspected = inspect(value);
    if (inspected.length > 128) {
      inspected = inspected.slice(0, 128) + "...";
    }
    const type = name.includes(".") ? "property" : "argument";
    return `The ${type} '${name}' ${reason}. Received ${inspected}`;
  }, TypeError);
  E("ERR_INVALID_RETURN_VALUE", (input, name, value) => {
    var _value$constructor;
    const type = value !== null && value !== undefined && (_value$constructor = value.constructor) !== null && _value$constructor !== undefined && _value$constructor.name ? `instance of ${value.constructor.name}` : `type ${typeof value}`;
    return `Expected ${input} to be returned from the "${name}"` + ` function but got ${type}.`;
  }, TypeError);
  E("ERR_MISSING_ARGS", (...args) => {
    assert(args.length > 0, "At least one arg needs to be specified");
    let msg;
    const len = args.length;
    args = (Array.isArray(args) ? args : [args]).map((a) => `"${a}"`).join(" or ");
    switch (len) {
      case 1:
        msg += `The ${args[0]} argument`;
        break;
      case 2:
        msg += `The ${args[0]} and ${args[1]} arguments`;
        break;
      default:
        {
          const last = args.pop();
          msg += `The ${args.join(", ")}, and ${last} arguments`;
        }
        break;
    }
    return `${msg} must be specified`;
  }, TypeError);
  E("ERR_OUT_OF_RANGE", (str, range, input) => {
    assert(range, 'Missing "range" argument');
    let received;
    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
      received = addNumericalSeparator(String(input));
    } else if (typeof input === "bigint") {
      received = String(input);
      const limit = BigInt(2) ** BigInt(32);
      if (input > limit || input < -limit) {
        received = addNumericalSeparator(received);
      }
      received += "n";
    } else {
      received = inspect(input);
    }
    return `The value of "${str}" is out of range. It must be ${range}. Received ${received}`;
  }, RangeError);
  E("ERR_MULTIPLE_CALLBACK", "Callback called multiple times", Error);
  E("ERR_METHOD_NOT_IMPLEMENTED", "The %s method is not implemented", Error);
  E("ERR_STREAM_ALREADY_FINISHED", "Cannot call %s after a stream was finished", Error);
  E("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable", Error);
  E("ERR_STREAM_DESTROYED", "Cannot call %s after a stream was destroyed", Error);
  E("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
  E("ERR_STREAM_PREMATURE_CLOSE", "Premature close", Error);
  E("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF", Error);
  E("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event", Error);
  E("ERR_STREAM_WRITE_AFTER_END", "write after end", Error);
  E("ERR_UNKNOWN_ENCODING", "Unknown encoding: %s", TypeError);
  module.exports = {
    AbortError,
    aggregateTwoErrors: hideStackFrames(aggregateTwoErrors),
    hideStackFrames,
    codes
  };
});

// ../../node_modules/.pnpm/event-target-shim@5.0.1/node_modules/event-target-shim/dist/event-target-shim.js
var require_event_target_shim = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var privateData = new WeakMap;
  var wrappers = new WeakMap;
  function pd(event) {
    const retv = privateData.get(event);
    console.assert(retv != null, "'this' is expected an Event object, but got", event);
    return retv;
  }
  function setCancelFlag(data) {
    if (data.passiveListener != null) {
      if (typeof console !== "undefined" && typeof console.error === "function") {
        console.error("Unable to preventDefault inside passive event listener invocation.", data.passiveListener);
      }
      return;
    }
    if (!data.event.cancelable) {
      return;
    }
    data.canceled = true;
    if (typeof data.event.preventDefault === "function") {
      data.event.preventDefault();
    }
  }
  function Event(eventTarget, event) {
    privateData.set(this, {
      eventTarget,
      event,
      eventPhase: 2,
      currentTarget: eventTarget,
      canceled: false,
      stopped: false,
      immediateStopped: false,
      passiveListener: null,
      timeStamp: event.timeStamp || Date.now()
    });
    Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });
    const keys = Object.keys(event);
    for (let i = 0;i < keys.length; ++i) {
      const key = keys[i];
      if (!(key in this)) {
        Object.defineProperty(this, key, defineRedirectDescriptor(key));
      }
    }
  }
  Event.prototype = {
    get type() {
      return pd(this).event.type;
    },
    get target() {
      return pd(this).eventTarget;
    },
    get currentTarget() {
      return pd(this).currentTarget;
    },
    composedPath() {
      const currentTarget = pd(this).currentTarget;
      if (currentTarget == null) {
        return [];
      }
      return [currentTarget];
    },
    get NONE() {
      return 0;
    },
    get CAPTURING_PHASE() {
      return 1;
    },
    get AT_TARGET() {
      return 2;
    },
    get BUBBLING_PHASE() {
      return 3;
    },
    get eventPhase() {
      return pd(this).eventPhase;
    },
    stopPropagation() {
      const data = pd(this);
      data.stopped = true;
      if (typeof data.event.stopPropagation === "function") {
        data.event.stopPropagation();
      }
    },
    stopImmediatePropagation() {
      const data = pd(this);
      data.stopped = true;
      data.immediateStopped = true;
      if (typeof data.event.stopImmediatePropagation === "function") {
        data.event.stopImmediatePropagation();
      }
    },
    get bubbles() {
      return Boolean(pd(this).event.bubbles);
    },
    get cancelable() {
      return Boolean(pd(this).event.cancelable);
    },
    preventDefault() {
      setCancelFlag(pd(this));
    },
    get defaultPrevented() {
      return pd(this).canceled;
    },
    get composed() {
      return Boolean(pd(this).event.composed);
    },
    get timeStamp() {
      return pd(this).timeStamp;
    },
    get srcElement() {
      return pd(this).eventTarget;
    },
    get cancelBubble() {
      return pd(this).stopped;
    },
    set cancelBubble(value) {
      if (!value) {
        return;
      }
      const data = pd(this);
      data.stopped = true;
      if (typeof data.event.cancelBubble === "boolean") {
        data.event.cancelBubble = true;
      }
    },
    get returnValue() {
      return !pd(this).canceled;
    },
    set returnValue(value) {
      if (!value) {
        setCancelFlag(pd(this));
      }
    },
    initEvent() {}
  };
  Object.defineProperty(Event.prototype, "constructor", {
    value: Event,
    configurable: true,
    writable: true
  });
  if (typeof window !== "undefined" && typeof window.Event !== "undefined") {
    Object.setPrototypeOf(Event.prototype, window.Event.prototype);
    wrappers.set(window.Event.prototype, Event);
  }
  function defineRedirectDescriptor(key) {
    return {
      get() {
        return pd(this).event[key];
      },
      set(value) {
        pd(this).event[key] = value;
      },
      configurable: true,
      enumerable: true
    };
  }
  function defineCallDescriptor(key) {
    return {
      value() {
        const event = pd(this).event;
        return event[key].apply(event, arguments);
      },
      configurable: true,
      enumerable: true
    };
  }
  function defineWrapper(BaseEvent, proto) {
    const keys = Object.keys(proto);
    if (keys.length === 0) {
      return BaseEvent;
    }
    function CustomEvent(eventTarget, event) {
      BaseEvent.call(this, eventTarget, event);
    }
    CustomEvent.prototype = Object.create(BaseEvent.prototype, {
      constructor: { value: CustomEvent, configurable: true, writable: true }
    });
    for (let i = 0;i < keys.length; ++i) {
      const key = keys[i];
      if (!(key in BaseEvent.prototype)) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);
        const isFunc = typeof descriptor.value === "function";
        Object.defineProperty(CustomEvent.prototype, key, isFunc ? defineCallDescriptor(key) : defineRedirectDescriptor(key));
      }
    }
    return CustomEvent;
  }
  function getWrapper(proto) {
    if (proto == null || proto === Object.prototype) {
      return Event;
    }
    let wrapper = wrappers.get(proto);
    if (wrapper == null) {
      wrapper = defineWrapper(getWrapper(Object.getPrototypeOf(proto)), proto);
      wrappers.set(proto, wrapper);
    }
    return wrapper;
  }
  function wrapEvent(eventTarget, event) {
    const Wrapper = getWrapper(Object.getPrototypeOf(event));
    return new Wrapper(eventTarget, event);
  }
  function isStopped(event) {
    return pd(event).immediateStopped;
  }
  function setEventPhase(event, eventPhase) {
    pd(event).eventPhase = eventPhase;
  }
  function setCurrentTarget(event, currentTarget) {
    pd(event).currentTarget = currentTarget;
  }
  function setPassiveListener(event, passiveListener) {
    pd(event).passiveListener = passiveListener;
  }
  var listenersMap = new WeakMap;
  var CAPTURE = 1;
  var BUBBLE = 2;
  var ATTRIBUTE = 3;
  function isObject(x) {
    return x !== null && typeof x === "object";
  }
  function getListeners(eventTarget) {
    const listeners = listenersMap.get(eventTarget);
    if (listeners == null) {
      throw new TypeError("'this' is expected an EventTarget object, but got another value.");
    }
    return listeners;
  }
  function defineEventAttributeDescriptor(eventName) {
    return {
      get() {
        const listeners = getListeners(this);
        let node = listeners.get(eventName);
        while (node != null) {
          if (node.listenerType === ATTRIBUTE) {
            return node.listener;
          }
          node = node.next;
        }
        return null;
      },
      set(listener) {
        if (typeof listener !== "function" && !isObject(listener)) {
          listener = null;
        }
        const listeners = getListeners(this);
        let prev = null;
        let node = listeners.get(eventName);
        while (node != null) {
          if (node.listenerType === ATTRIBUTE) {
            if (prev !== null) {
              prev.next = node.next;
            } else if (node.next !== null) {
              listeners.set(eventName, node.next);
            } else {
              listeners.delete(eventName);
            }
          } else {
            prev = node;
          }
          node = node.next;
        }
        if (listener !== null) {
          const newNode = {
            listener,
            listenerType: ATTRIBUTE,
            passive: false,
            once: false,
            next: null
          };
          if (prev === null) {
            listeners.set(eventName, newNode);
          } else {
            prev.next = newNode;
          }
        }
      },
      configurable: true,
      enumerable: true
    };
  }
  function defineEventAttribute(eventTargetPrototype, eventName) {
    Object.defineProperty(eventTargetPrototype, `on${eventName}`, defineEventAttributeDescriptor(eventName));
  }
  function defineCustomEventTarget(eventNames) {
    function CustomEventTarget() {
      EventTarget.call(this);
    }
    CustomEventTarget.prototype = Object.create(EventTarget.prototype, {
      constructor: {
        value: CustomEventTarget,
        configurable: true,
        writable: true
      }
    });
    for (let i = 0;i < eventNames.length; ++i) {
      defineEventAttribute(CustomEventTarget.prototype, eventNames[i]);
    }
    return CustomEventTarget;
  }
  function EventTarget() {
    if (this instanceof EventTarget) {
      listenersMap.set(this, new Map);
      return;
    }
    if (arguments.length === 1 && Array.isArray(arguments[0])) {
      return defineCustomEventTarget(arguments[0]);
    }
    if (arguments.length > 0) {
      const types = new Array(arguments.length);
      for (let i = 0;i < arguments.length; ++i) {
        types[i] = arguments[i];
      }
      return defineCustomEventTarget(types);
    }
    throw new TypeError("Cannot call a class as a function");
  }
  EventTarget.prototype = {
    addEventListener(eventName, listener, options) {
      if (listener == null) {
        return;
      }
      if (typeof listener !== "function" && !isObject(listener)) {
        throw new TypeError("'listener' should be a function or an object.");
      }
      const listeners = getListeners(this);
      const optionsIsObj = isObject(options);
      const capture = optionsIsObj ? Boolean(options.capture) : Boolean(options);
      const listenerType = capture ? CAPTURE : BUBBLE;
      const newNode = {
        listener,
        listenerType,
        passive: optionsIsObj && Boolean(options.passive),
        once: optionsIsObj && Boolean(options.once),
        next: null
      };
      let node = listeners.get(eventName);
      if (node === undefined) {
        listeners.set(eventName, newNode);
        return;
      }
      let prev = null;
      while (node != null) {
        if (node.listener === listener && node.listenerType === listenerType) {
          return;
        }
        prev = node;
        node = node.next;
      }
      prev.next = newNode;
    },
    removeEventListener(eventName, listener, options) {
      if (listener == null) {
        return;
      }
      const listeners = getListeners(this);
      const capture = isObject(options) ? Boolean(options.capture) : Boolean(options);
      const listenerType = capture ? CAPTURE : BUBBLE;
      let prev = null;
      let node = listeners.get(eventName);
      while (node != null) {
        if (node.listener === listener && node.listenerType === listenerType) {
          if (prev !== null) {
            prev.next = node.next;
          } else if (node.next !== null) {
            listeners.set(eventName, node.next);
          } else {
            listeners.delete(eventName);
          }
          return;
        }
        prev = node;
        node = node.next;
      }
    },
    dispatchEvent(event) {
      if (event == null || typeof event.type !== "string") {
        throw new TypeError('"event.type" should be a string.');
      }
      const listeners = getListeners(this);
      const eventName = event.type;
      let node = listeners.get(eventName);
      if (node == null) {
        return true;
      }
      const wrappedEvent = wrapEvent(this, event);
      let prev = null;
      while (node != null) {
        if (node.once) {
          if (prev !== null) {
            prev.next = node.next;
          } else if (node.next !== null) {
            listeners.set(eventName, node.next);
          } else {
            listeners.delete(eventName);
          }
        } else {
          prev = node;
        }
        setPassiveListener(wrappedEvent, node.passive ? node.listener : null);
        if (typeof node.listener === "function") {
          try {
            node.listener.call(this, wrappedEvent);
          } catch (err) {
            if (typeof console !== "undefined" && typeof console.error === "function") {
              console.error(err);
            }
          }
        } else if (node.listenerType !== ATTRIBUTE && typeof node.listener.handleEvent === "function") {
          node.listener.handleEvent(wrappedEvent);
        }
        if (isStopped(wrappedEvent)) {
          break;
        }
        node = node.next;
      }
      setPassiveListener(wrappedEvent, null);
      setEventPhase(wrappedEvent, 0);
      setCurrentTarget(wrappedEvent, null);
      return !wrappedEvent.defaultPrevented;
    }
  };
  Object.defineProperty(EventTarget.prototype, "constructor", {
    value: EventTarget,
    configurable: true,
    writable: true
  });
  if (typeof window !== "undefined" && typeof window.EventTarget !== "undefined") {
    Object.setPrototypeOf(EventTarget.prototype, window.EventTarget.prototype);
  }
  exports.defineEventAttribute = defineEventAttribute;
  exports.EventTarget = EventTarget;
  exports.default = EventTarget;
  module.exports = EventTarget;
  module.exports.EventTarget = module.exports["default"] = EventTarget;
  module.exports.defineEventAttribute = defineEventAttribute;
});

// ../../node_modules/.pnpm/abort-controller@3.0.0/node_modules/abort-controller/dist/abort-controller.js
var require_abort_controller = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var eventTargetShim = require_event_target_shim();

  class AbortSignal extends eventTargetShim.EventTarget {
    constructor() {
      super();
      throw new TypeError("AbortSignal cannot be constructed directly");
    }
    get aborted() {
      const aborted = abortedFlags.get(this);
      if (typeof aborted !== "boolean") {
        throw new TypeError(`Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? "null" : typeof this}`);
      }
      return aborted;
    }
  }
  eventTargetShim.defineEventAttribute(AbortSignal.prototype, "abort");
  function createAbortSignal() {
    const signal = Object.create(AbortSignal.prototype);
    eventTargetShim.EventTarget.call(signal);
    abortedFlags.set(signal, false);
    return signal;
  }
  function abortSignal(signal) {
    if (abortedFlags.get(signal) !== false) {
      return;
    }
    abortedFlags.set(signal, true);
    signal.dispatchEvent({ type: "abort" });
  }
  var abortedFlags = new WeakMap;
  Object.defineProperties(AbortSignal.prototype, {
    aborted: { enumerable: true }
  });
  if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
    Object.defineProperty(AbortSignal.prototype, Symbol.toStringTag, {
      configurable: true,
      value: "AbortSignal"
    });
  }

  class AbortController {
    constructor() {
      signals.set(this, createAbortSignal());
    }
    get signal() {
      return getSignal(this);
    }
    abort() {
      abortSignal(getSignal(this));
    }
  }
  var signals = new WeakMap;
  function getSignal(controller) {
    const signal = signals.get(controller);
    if (signal == null) {
      throw new TypeError(`Expected 'this' to be an 'AbortController' object, but got ${controller === null ? "null" : typeof controller}`);
    }
    return signal;
  }
  Object.defineProperties(AbortController.prototype, {
    signal: { enumerable: true },
    abort: { enumerable: true }
  });
  if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
    Object.defineProperty(AbortController.prototype, Symbol.toStringTag, {
      configurable: true,
      value: "AbortController"
    });
  }
  exports.AbortController = AbortController;
  exports.AbortSignal = AbortSignal;
  exports.default = AbortController;
  module.exports = AbortController;
  module.exports.AbortController = module.exports["default"] = AbortController;
  module.exports.AbortSignal = AbortSignal;
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/ours/util.js
var require_util2 = __commonJS((exports, module) => {
  var bufferModule = __require("buffer");
  var { format, inspect } = require_inspect();
  var {
    codes: { ERR_INVALID_ARG_TYPE }
  } = require_errors();
  var { kResistStopPropagation, AggregateError, SymbolDispose } = require_primordials();
  var AbortSignal = globalThis.AbortSignal || require_abort_controller().AbortSignal;
  var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
  var AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
  var Blob = globalThis.Blob || bufferModule.Blob;
  var isBlob = typeof Blob !== "undefined" ? function isBlob(b) {
    return b instanceof Blob;
  } : function isBlob(b) {
    return false;
  };
  var validateAbortSignal = (signal, name) => {
    if (signal !== undefined && (signal === null || typeof signal !== "object" || !("aborted" in signal))) {
      throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
    }
  };
  var validateFunction = (value, name) => {
    if (typeof value !== "function") {
      throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
    }
  };
  module.exports = {
    AggregateError,
    kEmptyObject: Object.freeze({}),
    once(callback) {
      let called = false;
      return function(...args) {
        if (called) {
          return;
        }
        called = true;
        callback.apply(this, args);
      };
    },
    createDeferredPromise: function() {
      let resolve;
      let reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return {
        promise,
        resolve,
        reject
      };
    },
    promisify(fn) {
      return new Promise((resolve, reject) => {
        fn((err, ...args) => {
          if (err) {
            return reject(err);
          }
          return resolve(...args);
        });
      });
    },
    debuglog() {
      return function() {};
    },
    format,
    inspect,
    types: {
      isAsyncFunction(fn) {
        return fn instanceof AsyncFunction;
      },
      isArrayBufferView(arr) {
        return ArrayBuffer.isView(arr);
      }
    },
    isBlob,
    deprecate(fn, message) {
      return fn;
    },
    addAbortListener: __require("events").addAbortListener || function addAbortListener(signal, listener) {
      if (signal === undefined) {
        throw new ERR_INVALID_ARG_TYPE("signal", "AbortSignal", signal);
      }
      validateAbortSignal(signal, "signal");
      validateFunction(listener, "listener");
      let removeEventListener;
      if (signal.aborted) {
        queueMicrotask(() => listener());
      } else {
        signal.addEventListener("abort", listener, {
          __proto__: null,
          once: true,
          [kResistStopPropagation]: true
        });
        removeEventListener = () => {
          signal.removeEventListener("abort", listener);
        };
      }
      return {
        __proto__: null,
        [SymbolDispose]() {
          var _removeEventListener;
          (_removeEventListener = removeEventListener) === null || _removeEventListener === undefined || _removeEventListener();
        }
      };
    },
    AbortSignalAny: AbortSignal.any || function AbortSignalAny(signals) {
      if (signals.length === 1) {
        return signals[0];
      }
      const ac = new AbortController;
      const abort = () => ac.abort();
      signals.forEach((signal) => {
        validateAbortSignal(signal, "signals");
        signal.addEventListener("abort", abort, {
          once: true
        });
      });
      ac.signal.addEventListener("abort", () => {
        signals.forEach((signal) => signal.removeEventListener("abort", abort));
      }, {
        once: true
      });
      return ac.signal;
    }
  };
  module.exports.promisify.custom = Symbol.for("nodejs.util.promisify.custom");
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/validators.js
var require_validators = __commonJS((exports, module) => {
  var {
    ArrayIsArray,
    ArrayPrototypeIncludes,
    ArrayPrototypeJoin,
    ArrayPrototypeMap,
    NumberIsInteger,
    NumberIsNaN,
    NumberMAX_SAFE_INTEGER,
    NumberMIN_SAFE_INTEGER,
    NumberParseInt,
    ObjectPrototypeHasOwnProperty,
    RegExpPrototypeExec,
    String: String2,
    StringPrototypeToUpperCase,
    StringPrototypeTrim
  } = require_primordials();
  var {
    hideStackFrames,
    codes: { ERR_SOCKET_BAD_PORT, ERR_INVALID_ARG_TYPE, ERR_INVALID_ARG_VALUE, ERR_OUT_OF_RANGE, ERR_UNKNOWN_SIGNAL }
  } = require_errors();
  var { normalizeEncoding } = require_util2();
  var { isAsyncFunction, isArrayBufferView } = require_util2().types;
  var signals = {};
  function isInt32(value) {
    return value === (value | 0);
  }
  function isUint32(value) {
    return value === value >>> 0;
  }
  var octalReg = /^[0-7]+$/;
  var modeDesc = "must be a 32-bit unsigned integer or an octal string";
  function parseFileMode(value, name, def) {
    if (typeof value === "undefined") {
      value = def;
    }
    if (typeof value === "string") {
      if (RegExpPrototypeExec(octalReg, value) === null) {
        throw new ERR_INVALID_ARG_VALUE(name, value, modeDesc);
      }
      value = NumberParseInt(value, 8);
    }
    validateUint32(value, name);
    return value;
  }
  var validateInteger = hideStackFrames((value, name, min = NumberMIN_SAFE_INTEGER, max = NumberMAX_SAFE_INTEGER) => {
    if (typeof value !== "number")
      throw new ERR_INVALID_ARG_TYPE(name, "number", value);
    if (!NumberIsInteger(value))
      throw new ERR_OUT_OF_RANGE(name, "an integer", value);
    if (value < min || value > max)
      throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
  });
  var validateInt32 = hideStackFrames((value, name, min = -2147483648, max = 2147483647) => {
    if (typeof value !== "number") {
      throw new ERR_INVALID_ARG_TYPE(name, "number", value);
    }
    if (!NumberIsInteger(value)) {
      throw new ERR_OUT_OF_RANGE(name, "an integer", value);
    }
    if (value < min || value > max) {
      throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
    }
  });
  var validateUint32 = hideStackFrames((value, name, positive = false) => {
    if (typeof value !== "number") {
      throw new ERR_INVALID_ARG_TYPE(name, "number", value);
    }
    if (!NumberIsInteger(value)) {
      throw new ERR_OUT_OF_RANGE(name, "an integer", value);
    }
    const min = positive ? 1 : 0;
    const max = 4294967295;
    if (value < min || value > max) {
      throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
    }
  });
  function validateString(value, name) {
    if (typeof value !== "string")
      throw new ERR_INVALID_ARG_TYPE(name, "string", value);
  }
  function validateNumber(value, name, min = undefined, max) {
    if (typeof value !== "number")
      throw new ERR_INVALID_ARG_TYPE(name, "number", value);
    if (min != null && value < min || max != null && value > max || (min != null || max != null) && NumberIsNaN(value)) {
      throw new ERR_OUT_OF_RANGE(name, `${min != null ? `>= ${min}` : ""}${min != null && max != null ? " && " : ""}${max != null ? `<= ${max}` : ""}`, value);
    }
  }
  var validateOneOf = hideStackFrames((value, name, oneOf) => {
    if (!ArrayPrototypeIncludes(oneOf, value)) {
      const allowed = ArrayPrototypeJoin(ArrayPrototypeMap(oneOf, (v) => typeof v === "string" ? `'${v}'` : String2(v)), ", ");
      const reason = "must be one of: " + allowed;
      throw new ERR_INVALID_ARG_VALUE(name, value, reason);
    }
  });
  function validateBoolean(value, name) {
    if (typeof value !== "boolean")
      throw new ERR_INVALID_ARG_TYPE(name, "boolean", value);
  }
  function getOwnPropertyValueOrDefault(options, key, defaultValue) {
    return options == null || !ObjectPrototypeHasOwnProperty(options, key) ? defaultValue : options[key];
  }
  var validateObject = hideStackFrames((value, name, options = null) => {
    const allowArray = getOwnPropertyValueOrDefault(options, "allowArray", false);
    const allowFunction = getOwnPropertyValueOrDefault(options, "allowFunction", false);
    const nullable = getOwnPropertyValueOrDefault(options, "nullable", false);
    if (!nullable && value === null || !allowArray && ArrayIsArray(value) || typeof value !== "object" && (!allowFunction || typeof value !== "function")) {
      throw new ERR_INVALID_ARG_TYPE(name, "Object", value);
    }
  });
  var validateDictionary = hideStackFrames((value, name) => {
    if (value != null && typeof value !== "object" && typeof value !== "function") {
      throw new ERR_INVALID_ARG_TYPE(name, "a dictionary", value);
    }
  });
  var validateArray = hideStackFrames((value, name, minLength = 0) => {
    if (!ArrayIsArray(value)) {
      throw new ERR_INVALID_ARG_TYPE(name, "Array", value);
    }
    if (value.length < minLength) {
      const reason = `must be longer than ${minLength}`;
      throw new ERR_INVALID_ARG_VALUE(name, value, reason);
    }
  });
  function validateStringArray(value, name) {
    validateArray(value, name);
    for (let i = 0;i < value.length; i++) {
      validateString(value[i], `${name}[${i}]`);
    }
  }
  function validateBooleanArray(value, name) {
    validateArray(value, name);
    for (let i = 0;i < value.length; i++) {
      validateBoolean(value[i], `${name}[${i}]`);
    }
  }
  function validateAbortSignalArray(value, name) {
    validateArray(value, name);
    for (let i = 0;i < value.length; i++) {
      const signal = value[i];
      const indexedName = `${name}[${i}]`;
      if (signal == null) {
        throw new ERR_INVALID_ARG_TYPE(indexedName, "AbortSignal", signal);
      }
      validateAbortSignal(signal, indexedName);
    }
  }
  function validateSignalName(signal, name = "signal") {
    validateString(signal, name);
    if (signals[signal] === undefined) {
      if (signals[StringPrototypeToUpperCase(signal)] !== undefined) {
        throw new ERR_UNKNOWN_SIGNAL(signal + " (signals must use all capital letters)");
      }
      throw new ERR_UNKNOWN_SIGNAL(signal);
    }
  }
  var validateBuffer = hideStackFrames((buffer, name = "buffer") => {
    if (!isArrayBufferView(buffer)) {
      throw new ERR_INVALID_ARG_TYPE(name, ["Buffer", "TypedArray", "DataView"], buffer);
    }
  });
  function validateEncoding(data, encoding) {
    const normalizedEncoding = normalizeEncoding(encoding);
    const length = data.length;
    if (normalizedEncoding === "hex" && length % 2 !== 0) {
      throw new ERR_INVALID_ARG_VALUE("encoding", encoding, `is invalid for data of length ${length}`);
    }
  }
  function validatePort(port, name = "Port", allowZero = true) {
    if (typeof port !== "number" && typeof port !== "string" || typeof port === "string" && StringPrototypeTrim(port).length === 0 || +port !== +port >>> 0 || port > 65535 || port === 0 && !allowZero) {
      throw new ERR_SOCKET_BAD_PORT(name, port, allowZero);
    }
    return port | 0;
  }
  var validateAbortSignal = hideStackFrames((signal, name) => {
    if (signal !== undefined && (signal === null || typeof signal !== "object" || !("aborted" in signal))) {
      throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
    }
  });
  var validateFunction = hideStackFrames((value, name) => {
    if (typeof value !== "function")
      throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
  });
  var validatePlainFunction = hideStackFrames((value, name) => {
    if (typeof value !== "function" || isAsyncFunction(value))
      throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
  });
  var validateUndefined = hideStackFrames((value, name) => {
    if (value !== undefined)
      throw new ERR_INVALID_ARG_TYPE(name, "undefined", value);
  });
  function validateUnion(value, name, union) {
    if (!ArrayPrototypeIncludes(union, value)) {
      throw new ERR_INVALID_ARG_TYPE(name, `('${ArrayPrototypeJoin(union, "|")}')`, value);
    }
  }
  var linkValueRegExp = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
  function validateLinkHeaderFormat(value, name) {
    if (typeof value === "undefined" || !RegExpPrototypeExec(linkValueRegExp, value)) {
      throw new ERR_INVALID_ARG_VALUE(name, value, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
    }
  }
  function validateLinkHeaderValue(hints) {
    if (typeof hints === "string") {
      validateLinkHeaderFormat(hints, "hints");
      return hints;
    } else if (ArrayIsArray(hints)) {
      const hintsLength = hints.length;
      let result = "";
      if (hintsLength === 0) {
        return result;
      }
      for (let i = 0;i < hintsLength; i++) {
        const link = hints[i];
        validateLinkHeaderFormat(link, "hints");
        result += link;
        if (i !== hintsLength - 1) {
          result += ", ";
        }
      }
      return result;
    }
    throw new ERR_INVALID_ARG_VALUE("hints", hints, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
  }
  module.exports = {
    isInt32,
    isUint32,
    parseFileMode,
    validateArray,
    validateStringArray,
    validateBooleanArray,
    validateAbortSignalArray,
    validateBoolean,
    validateBuffer,
    validateDictionary,
    validateEncoding,
    validateFunction,
    validateInt32,
    validateInteger,
    validateNumber,
    validateObject,
    validateOneOf,
    validatePlainFunction,
    validatePort,
    validateSignalName,
    validateString,
    validateUint32,
    validateUndefined,
    validateUnion,
    validateAbortSignal,
    validateLinkHeaderValue
  };
});

// ../../node_modules/.pnpm/process@0.11.10/node_modules/process/index.js
var require_process = __commonJS((exports, module) => {
  module.exports = global.process;
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/utils.js
var require_utils = __commonJS((exports, module) => {
  var { SymbolAsyncIterator, SymbolIterator, SymbolFor } = require_primordials();
  var kIsDestroyed = SymbolFor("nodejs.stream.destroyed");
  var kIsErrored = SymbolFor("nodejs.stream.errored");
  var kIsReadable = SymbolFor("nodejs.stream.readable");
  var kIsWritable = SymbolFor("nodejs.stream.writable");
  var kIsDisturbed = SymbolFor("nodejs.stream.disturbed");
  var kIsClosedPromise = SymbolFor("nodejs.webstream.isClosedPromise");
  var kControllerErrorFunction = SymbolFor("nodejs.webstream.controllerErrorFunction");
  function isReadableNodeStream(obj, strict = false) {
    var _obj$_readableState;
    return !!(obj && typeof obj.pipe === "function" && typeof obj.on === "function" && (!strict || typeof obj.pause === "function" && typeof obj.resume === "function") && (!obj._writableState || ((_obj$_readableState = obj._readableState) === null || _obj$_readableState === undefined ? undefined : _obj$_readableState.readable) !== false) && (!obj._writableState || obj._readableState));
  }
  function isWritableNodeStream(obj) {
    var _obj$_writableState;
    return !!(obj && typeof obj.write === "function" && typeof obj.on === "function" && (!obj._readableState || ((_obj$_writableState = obj._writableState) === null || _obj$_writableState === undefined ? undefined : _obj$_writableState.writable) !== false));
  }
  function isDuplexNodeStream(obj) {
    return !!(obj && typeof obj.pipe === "function" && obj._readableState && typeof obj.on === "function" && typeof obj.write === "function");
  }
  function isNodeStream(obj) {
    return obj && (obj._readableState || obj._writableState || typeof obj.write === "function" && typeof obj.on === "function" || typeof obj.pipe === "function" && typeof obj.on === "function");
  }
  function isReadableStream(obj) {
    return !!(obj && !isNodeStream(obj) && typeof obj.pipeThrough === "function" && typeof obj.getReader === "function" && typeof obj.cancel === "function");
  }
  function isWritableStream(obj) {
    return !!(obj && !isNodeStream(obj) && typeof obj.getWriter === "function" && typeof obj.abort === "function");
  }
  function isTransformStream(obj) {
    return !!(obj && !isNodeStream(obj) && typeof obj.readable === "object" && typeof obj.writable === "object");
  }
  function isWebStream(obj) {
    return isReadableStream(obj) || isWritableStream(obj) || isTransformStream(obj);
  }
  function isIterable(obj, isAsync) {
    if (obj == null)
      return false;
    if (isAsync === true)
      return typeof obj[SymbolAsyncIterator] === "function";
    if (isAsync === false)
      return typeof obj[SymbolIterator] === "function";
    return typeof obj[SymbolAsyncIterator] === "function" || typeof obj[SymbolIterator] === "function";
  }
  function isDestroyed(stream) {
    if (!isNodeStream(stream))
      return null;
    const wState = stream._writableState;
    const rState = stream._readableState;
    const state = wState || rState;
    return !!(stream.destroyed || stream[kIsDestroyed] || state !== null && state !== undefined && state.destroyed);
  }
  function isWritableEnded(stream) {
    if (!isWritableNodeStream(stream))
      return null;
    if (stream.writableEnded === true)
      return true;
    const wState = stream._writableState;
    if (wState !== null && wState !== undefined && wState.errored)
      return false;
    if (typeof (wState === null || wState === undefined ? undefined : wState.ended) !== "boolean")
      return null;
    return wState.ended;
  }
  function isWritableFinished(stream, strict) {
    if (!isWritableNodeStream(stream))
      return null;
    if (stream.writableFinished === true)
      return true;
    const wState = stream._writableState;
    if (wState !== null && wState !== undefined && wState.errored)
      return false;
    if (typeof (wState === null || wState === undefined ? undefined : wState.finished) !== "boolean")
      return null;
    return !!(wState.finished || strict === false && wState.ended === true && wState.length === 0);
  }
  function isReadableEnded(stream) {
    if (!isReadableNodeStream(stream))
      return null;
    if (stream.readableEnded === true)
      return true;
    const rState = stream._readableState;
    if (!rState || rState.errored)
      return false;
    if (typeof (rState === null || rState === undefined ? undefined : rState.ended) !== "boolean")
      return null;
    return rState.ended;
  }
  function isReadableFinished(stream, strict) {
    if (!isReadableNodeStream(stream))
      return null;
    const rState = stream._readableState;
    if (rState !== null && rState !== undefined && rState.errored)
      return false;
    if (typeof (rState === null || rState === undefined ? undefined : rState.endEmitted) !== "boolean")
      return null;
    return !!(rState.endEmitted || strict === false && rState.ended === true && rState.length === 0);
  }
  function isReadable(stream) {
    if (stream && stream[kIsReadable] != null)
      return stream[kIsReadable];
    if (typeof (stream === null || stream === undefined ? undefined : stream.readable) !== "boolean")
      return null;
    if (isDestroyed(stream))
      return false;
    return isReadableNodeStream(stream) && stream.readable && !isReadableFinished(stream);
  }
  function isWritable(stream) {
    if (stream && stream[kIsWritable] != null)
      return stream[kIsWritable];
    if (typeof (stream === null || stream === undefined ? undefined : stream.writable) !== "boolean")
      return null;
    if (isDestroyed(stream))
      return false;
    return isWritableNodeStream(stream) && stream.writable && !isWritableEnded(stream);
  }
  function isFinished(stream, opts) {
    if (!isNodeStream(stream)) {
      return null;
    }
    if (isDestroyed(stream)) {
      return true;
    }
    if ((opts === null || opts === undefined ? undefined : opts.readable) !== false && isReadable(stream)) {
      return false;
    }
    if ((opts === null || opts === undefined ? undefined : opts.writable) !== false && isWritable(stream)) {
      return false;
    }
    return true;
  }
  function isWritableErrored(stream) {
    var _stream$_writableStat, _stream$_writableStat2;
    if (!isNodeStream(stream)) {
      return null;
    }
    if (stream.writableErrored) {
      return stream.writableErrored;
    }
    return (_stream$_writableStat = (_stream$_writableStat2 = stream._writableState) === null || _stream$_writableStat2 === undefined ? undefined : _stream$_writableStat2.errored) !== null && _stream$_writableStat !== undefined ? _stream$_writableStat : null;
  }
  function isReadableErrored(stream) {
    var _stream$_readableStat, _stream$_readableStat2;
    if (!isNodeStream(stream)) {
      return null;
    }
    if (stream.readableErrored) {
      return stream.readableErrored;
    }
    return (_stream$_readableStat = (_stream$_readableStat2 = stream._readableState) === null || _stream$_readableStat2 === undefined ? undefined : _stream$_readableStat2.errored) !== null && _stream$_readableStat !== undefined ? _stream$_readableStat : null;
  }
  function isClosed(stream) {
    if (!isNodeStream(stream)) {
      return null;
    }
    if (typeof stream.closed === "boolean") {
      return stream.closed;
    }
    const wState = stream._writableState;
    const rState = stream._readableState;
    if (typeof (wState === null || wState === undefined ? undefined : wState.closed) === "boolean" || typeof (rState === null || rState === undefined ? undefined : rState.closed) === "boolean") {
      return (wState === null || wState === undefined ? undefined : wState.closed) || (rState === null || rState === undefined ? undefined : rState.closed);
    }
    if (typeof stream._closed === "boolean" && isOutgoingMessage(stream)) {
      return stream._closed;
    }
    return null;
  }
  function isOutgoingMessage(stream) {
    return typeof stream._closed === "boolean" && typeof stream._defaultKeepAlive === "boolean" && typeof stream._removedConnection === "boolean" && typeof stream._removedContLen === "boolean";
  }
  function isServerResponse(stream) {
    return typeof stream._sent100 === "boolean" && isOutgoingMessage(stream);
  }
  function isServerRequest(stream) {
    var _stream$req;
    return typeof stream._consuming === "boolean" && typeof stream._dumped === "boolean" && ((_stream$req = stream.req) === null || _stream$req === undefined ? undefined : _stream$req.upgradeOrConnect) === undefined;
  }
  function willEmitClose(stream) {
    if (!isNodeStream(stream))
      return null;
    const wState = stream._writableState;
    const rState = stream._readableState;
    const state = wState || rState;
    return !state && isServerResponse(stream) || !!(state && state.autoDestroy && state.emitClose && state.closed === false);
  }
  function isDisturbed(stream) {
    var _stream$kIsDisturbed;
    return !!(stream && ((_stream$kIsDisturbed = stream[kIsDisturbed]) !== null && _stream$kIsDisturbed !== undefined ? _stream$kIsDisturbed : stream.readableDidRead || stream.readableAborted));
  }
  function isErrored(stream) {
    var _ref, _ref2, _ref3, _ref4, _ref5, _stream$kIsErrored, _stream$_readableStat3, _stream$_writableStat3, _stream$_readableStat4, _stream$_writableStat4;
    return !!(stream && ((_ref = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_stream$kIsErrored = stream[kIsErrored]) !== null && _stream$kIsErrored !== undefined ? _stream$kIsErrored : stream.readableErrored) !== null && _ref5 !== undefined ? _ref5 : stream.writableErrored) !== null && _ref4 !== undefined ? _ref4 : (_stream$_readableStat3 = stream._readableState) === null || _stream$_readableStat3 === undefined ? undefined : _stream$_readableStat3.errorEmitted) !== null && _ref3 !== undefined ? _ref3 : (_stream$_writableStat3 = stream._writableState) === null || _stream$_writableStat3 === undefined ? undefined : _stream$_writableStat3.errorEmitted) !== null && _ref2 !== undefined ? _ref2 : (_stream$_readableStat4 = stream._readableState) === null || _stream$_readableStat4 === undefined ? undefined : _stream$_readableStat4.errored) !== null && _ref !== undefined ? _ref : (_stream$_writableStat4 = stream._writableState) === null || _stream$_writableStat4 === undefined ? undefined : _stream$_writableStat4.errored));
  }
  module.exports = {
    isDestroyed,
    kIsDestroyed,
    isDisturbed,
    kIsDisturbed,
    isErrored,
    kIsErrored,
    isReadable,
    kIsReadable,
    kIsClosedPromise,
    kControllerErrorFunction,
    kIsWritable,
    isClosed,
    isDuplexNodeStream,
    isFinished,
    isIterable,
    isReadableNodeStream,
    isReadableStream,
    isReadableEnded,
    isReadableFinished,
    isReadableErrored,
    isNodeStream,
    isWebStream,
    isWritable,
    isWritableNodeStream,
    isWritableStream,
    isWritableEnded,
    isWritableFinished,
    isWritableErrored,
    isServerRequest,
    isServerResponse,
    willEmitClose,
    isTransformStream
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/end-of-stream.js
var require_end_of_stream = __commonJS((exports, module) => {
  var process2 = require_process();
  var { AbortError, codes } = require_errors();
  var { ERR_INVALID_ARG_TYPE, ERR_STREAM_PREMATURE_CLOSE } = codes;
  var { kEmptyObject, once } = require_util2();
  var { validateAbortSignal, validateFunction, validateObject, validateBoolean } = require_validators();
  var { Promise: Promise2, PromisePrototypeThen, SymbolDispose } = require_primordials();
  var {
    isClosed,
    isReadable,
    isReadableNodeStream,
    isReadableStream,
    isReadableFinished,
    isReadableErrored,
    isWritable,
    isWritableNodeStream,
    isWritableStream,
    isWritableFinished,
    isWritableErrored,
    isNodeStream,
    willEmitClose: _willEmitClose,
    kIsClosedPromise
  } = require_utils();
  var addAbortListener;
  function isRequest(stream) {
    return stream.setHeader && typeof stream.abort === "function";
  }
  var nop = () => {};
  function eos(stream, options, callback) {
    var _options$readable, _options$writable;
    if (arguments.length === 2) {
      callback = options;
      options = kEmptyObject;
    } else if (options == null) {
      options = kEmptyObject;
    } else {
      validateObject(options, "options");
    }
    validateFunction(callback, "callback");
    validateAbortSignal(options.signal, "options.signal");
    callback = once(callback);
    if (isReadableStream(stream) || isWritableStream(stream)) {
      return eosWeb(stream, options, callback);
    }
    if (!isNodeStream(stream)) {
      throw new ERR_INVALID_ARG_TYPE("stream", ["ReadableStream", "WritableStream", "Stream"], stream);
    }
    const readable = (_options$readable = options.readable) !== null && _options$readable !== undefined ? _options$readable : isReadableNodeStream(stream);
    const writable = (_options$writable = options.writable) !== null && _options$writable !== undefined ? _options$writable : isWritableNodeStream(stream);
    const wState = stream._writableState;
    const rState = stream._readableState;
    const onlegacyfinish = () => {
      if (!stream.writable) {
        onfinish();
      }
    };
    let willEmitClose = _willEmitClose(stream) && isReadableNodeStream(stream) === readable && isWritableNodeStream(stream) === writable;
    let writableFinished = isWritableFinished(stream, false);
    const onfinish = () => {
      writableFinished = true;
      if (stream.destroyed) {
        willEmitClose = false;
      }
      if (willEmitClose && (!stream.readable || readable)) {
        return;
      }
      if (!readable || readableFinished) {
        callback.call(stream);
      }
    };
    let readableFinished = isReadableFinished(stream, false);
    const onend = () => {
      readableFinished = true;
      if (stream.destroyed) {
        willEmitClose = false;
      }
      if (willEmitClose && (!stream.writable || writable)) {
        return;
      }
      if (!writable || writableFinished) {
        callback.call(stream);
      }
    };
    const onerror = (err) => {
      callback.call(stream, err);
    };
    let closed = isClosed(stream);
    const onclose = () => {
      closed = true;
      const errored = isWritableErrored(stream) || isReadableErrored(stream);
      if (errored && typeof errored !== "boolean") {
        return callback.call(stream, errored);
      }
      if (readable && !readableFinished && isReadableNodeStream(stream, true)) {
        if (!isReadableFinished(stream, false))
          return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE);
      }
      if (writable && !writableFinished) {
        if (!isWritableFinished(stream, false))
          return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE);
      }
      callback.call(stream);
    };
    const onclosed = () => {
      closed = true;
      const errored = isWritableErrored(stream) || isReadableErrored(stream);
      if (errored && typeof errored !== "boolean") {
        return callback.call(stream, errored);
      }
      callback.call(stream);
    };
    const onrequest = () => {
      stream.req.on("finish", onfinish);
    };
    if (isRequest(stream)) {
      stream.on("complete", onfinish);
      if (!willEmitClose) {
        stream.on("abort", onclose);
      }
      if (stream.req) {
        onrequest();
      } else {
        stream.on("request", onrequest);
      }
    } else if (writable && !wState) {
      stream.on("end", onlegacyfinish);
      stream.on("close", onlegacyfinish);
    }
    if (!willEmitClose && typeof stream.aborted === "boolean") {
      stream.on("aborted", onclose);
    }
    stream.on("end", onend);
    stream.on("finish", onfinish);
    if (options.error !== false) {
      stream.on("error", onerror);
    }
    stream.on("close", onclose);
    if (closed) {
      process2.nextTick(onclose);
    } else if (wState !== null && wState !== undefined && wState.errorEmitted || rState !== null && rState !== undefined && rState.errorEmitted) {
      if (!willEmitClose) {
        process2.nextTick(onclosed);
      }
    } else if (!readable && (!willEmitClose || isReadable(stream)) && (writableFinished || isWritable(stream) === false)) {
      process2.nextTick(onclosed);
    } else if (!writable && (!willEmitClose || isWritable(stream)) && (readableFinished || isReadable(stream) === false)) {
      process2.nextTick(onclosed);
    } else if (rState && stream.req && stream.aborted) {
      process2.nextTick(onclosed);
    }
    const cleanup = () => {
      callback = nop;
      stream.removeListener("aborted", onclose);
      stream.removeListener("complete", onfinish);
      stream.removeListener("abort", onclose);
      stream.removeListener("request", onrequest);
      if (stream.req)
        stream.req.removeListener("finish", onfinish);
      stream.removeListener("end", onlegacyfinish);
      stream.removeListener("close", onlegacyfinish);
      stream.removeListener("finish", onfinish);
      stream.removeListener("end", onend);
      stream.removeListener("error", onerror);
      stream.removeListener("close", onclose);
    };
    if (options.signal && !closed) {
      const abort = () => {
        const endCallback = callback;
        cleanup();
        endCallback.call(stream, new AbortError(undefined, {
          cause: options.signal.reason
        }));
      };
      if (options.signal.aborted) {
        process2.nextTick(abort);
      } else {
        addAbortListener = addAbortListener || require_util2().addAbortListener;
        const disposable = addAbortListener(options.signal, abort);
        const originalCallback = callback;
        callback = once((...args) => {
          disposable[SymbolDispose]();
          originalCallback.apply(stream, args);
        });
      }
    }
    return cleanup;
  }
  function eosWeb(stream, options, callback) {
    let isAborted = false;
    let abort = nop;
    if (options.signal) {
      abort = () => {
        isAborted = true;
        callback.call(stream, new AbortError(undefined, {
          cause: options.signal.reason
        }));
      };
      if (options.signal.aborted) {
        process2.nextTick(abort);
      } else {
        addAbortListener = addAbortListener || require_util2().addAbortListener;
        const disposable = addAbortListener(options.signal, abort);
        const originalCallback = callback;
        callback = once((...args) => {
          disposable[SymbolDispose]();
          originalCallback.apply(stream, args);
        });
      }
    }
    const resolverFn = (...args) => {
      if (!isAborted) {
        process2.nextTick(() => callback.apply(stream, args));
      }
    };
    PromisePrototypeThen(stream[kIsClosedPromise].promise, resolverFn, resolverFn);
    return nop;
  }
  function finished(stream, opts) {
    var _opts;
    let autoCleanup = false;
    if (opts === null) {
      opts = kEmptyObject;
    }
    if ((_opts = opts) !== null && _opts !== undefined && _opts.cleanup) {
      validateBoolean(opts.cleanup, "cleanup");
      autoCleanup = opts.cleanup;
    }
    return new Promise2((resolve, reject) => {
      const cleanup = eos(stream, opts, (err) => {
        if (autoCleanup) {
          cleanup();
        }
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  module.exports = eos;
  module.exports.finished = finished;
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy2 = __commonJS((exports, module) => {
  var process2 = require_process();
  var {
    aggregateTwoErrors,
    codes: { ERR_MULTIPLE_CALLBACK },
    AbortError
  } = require_errors();
  var { Symbol: Symbol2 } = require_primordials();
  var { kIsDestroyed, isDestroyed, isFinished, isServerRequest } = require_utils();
  var kDestroy = Symbol2("kDestroy");
  var kConstruct = Symbol2("kConstruct");
  function checkError(err, w, r) {
    if (err) {
      err.stack;
      if (w && !w.errored) {
        w.errored = err;
      }
      if (r && !r.errored) {
        r.errored = err;
      }
    }
  }
  function destroy(err, cb) {
    const r = this._readableState;
    const w = this._writableState;
    const s = w || r;
    if (w !== null && w !== undefined && w.destroyed || r !== null && r !== undefined && r.destroyed) {
      if (typeof cb === "function") {
        cb();
      }
      return this;
    }
    checkError(err, w, r);
    if (w) {
      w.destroyed = true;
    }
    if (r) {
      r.destroyed = true;
    }
    if (!s.constructed) {
      this.once(kDestroy, function(er) {
        _destroy(this, aggregateTwoErrors(er, err), cb);
      });
    } else {
      _destroy(this, err, cb);
    }
    return this;
  }
  function _destroy(self2, err, cb) {
    let called = false;
    function onDestroy(err2) {
      if (called) {
        return;
      }
      called = true;
      const r = self2._readableState;
      const w = self2._writableState;
      checkError(err2, w, r);
      if (w) {
        w.closed = true;
      }
      if (r) {
        r.closed = true;
      }
      if (typeof cb === "function") {
        cb(err2);
      }
      if (err2) {
        process2.nextTick(emitErrorCloseNT, self2, err2);
      } else {
        process2.nextTick(emitCloseNT, self2);
      }
    }
    try {
      self2._destroy(err || null, onDestroy);
    } catch (err2) {
      onDestroy(err2);
    }
  }
  function emitErrorCloseNT(self2, err) {
    emitErrorNT(self2, err);
    emitCloseNT(self2);
  }
  function emitCloseNT(self2) {
    const r = self2._readableState;
    const w = self2._writableState;
    if (w) {
      w.closeEmitted = true;
    }
    if (r) {
      r.closeEmitted = true;
    }
    if (w !== null && w !== undefined && w.emitClose || r !== null && r !== undefined && r.emitClose) {
      self2.emit("close");
    }
  }
  function emitErrorNT(self2, err) {
    const r = self2._readableState;
    const w = self2._writableState;
    if (w !== null && w !== undefined && w.errorEmitted || r !== null && r !== undefined && r.errorEmitted) {
      return;
    }
    if (w) {
      w.errorEmitted = true;
    }
    if (r) {
      r.errorEmitted = true;
    }
    self2.emit("error", err);
  }
  function undestroy() {
    const r = this._readableState;
    const w = this._writableState;
    if (r) {
      r.constructed = true;
      r.closed = false;
      r.closeEmitted = false;
      r.destroyed = false;
      r.errored = null;
      r.errorEmitted = false;
      r.reading = false;
      r.ended = r.readable === false;
      r.endEmitted = r.readable === false;
    }
    if (w) {
      w.constructed = true;
      w.destroyed = false;
      w.closed = false;
      w.closeEmitted = false;
      w.errored = null;
      w.errorEmitted = false;
      w.finalCalled = false;
      w.prefinished = false;
      w.ended = w.writable === false;
      w.ending = w.writable === false;
      w.finished = w.writable === false;
    }
  }
  function errorOrDestroy(stream, err, sync) {
    const r = stream._readableState;
    const w = stream._writableState;
    if (w !== null && w !== undefined && w.destroyed || r !== null && r !== undefined && r.destroyed) {
      return this;
    }
    if (r !== null && r !== undefined && r.autoDestroy || w !== null && w !== undefined && w.autoDestroy)
      stream.destroy(err);
    else if (err) {
      err.stack;
      if (w && !w.errored) {
        w.errored = err;
      }
      if (r && !r.errored) {
        r.errored = err;
      }
      if (sync) {
        process2.nextTick(emitErrorNT, stream, err);
      } else {
        emitErrorNT(stream, err);
      }
    }
  }
  function construct(stream, cb) {
    if (typeof stream._construct !== "function") {
      return;
    }
    const r = stream._readableState;
    const w = stream._writableState;
    if (r) {
      r.constructed = false;
    }
    if (w) {
      w.constructed = false;
    }
    stream.once(kConstruct, cb);
    if (stream.listenerCount(kConstruct) > 1) {
      return;
    }
    process2.nextTick(constructNT, stream);
  }
  function constructNT(stream) {
    let called = false;
    function onConstruct(err) {
      if (called) {
        errorOrDestroy(stream, err !== null && err !== undefined ? err : new ERR_MULTIPLE_CALLBACK);
        return;
      }
      called = true;
      const r = stream._readableState;
      const w = stream._writableState;
      const s = w || r;
      if (r) {
        r.constructed = true;
      }
      if (w) {
        w.constructed = true;
      }
      if (s.destroyed) {
        stream.emit(kDestroy, err);
      } else if (err) {
        errorOrDestroy(stream, err, true);
      } else {
        process2.nextTick(emitConstructNT, stream);
      }
    }
    try {
      stream._construct((err) => {
        process2.nextTick(onConstruct, err);
      });
    } catch (err) {
      process2.nextTick(onConstruct, err);
    }
  }
  function emitConstructNT(stream) {
    stream.emit(kConstruct);
  }
  function isRequest(stream) {
    return (stream === null || stream === undefined ? undefined : stream.setHeader) && typeof stream.abort === "function";
  }
  function emitCloseLegacy(stream) {
    stream.emit("close");
  }
  function emitErrorCloseLegacy(stream, err) {
    stream.emit("error", err);
    process2.nextTick(emitCloseLegacy, stream);
  }
  function destroyer(stream, err) {
    if (!stream || isDestroyed(stream)) {
      return;
    }
    if (!err && !isFinished(stream)) {
      err = new AbortError;
    }
    if (isServerRequest(stream)) {
      stream.socket = null;
      stream.destroy(err);
    } else if (isRequest(stream)) {
      stream.abort();
    } else if (isRequest(stream.req)) {
      stream.req.abort();
    } else if (typeof stream.destroy === "function") {
      stream.destroy(err);
    } else if (typeof stream.close === "function") {
      stream.close();
    } else if (err) {
      process2.nextTick(emitErrorCloseLegacy, stream, err);
    } else {
      process2.nextTick(emitCloseLegacy, stream);
    }
    if (!stream.destroyed) {
      stream[kIsDestroyed] = true;
    }
  }
  module.exports = {
    construct,
    destroyer,
    destroy,
    undestroy,
    errorOrDestroy
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/legacy.js
var require_legacy = __commonJS((exports, module) => {
  var { ArrayIsArray, ObjectSetPrototypeOf } = require_primordials();
  var { EventEmitter: EE } = __require("events");
  function Stream(opts) {
    EE.call(this, opts);
  }
  ObjectSetPrototypeOf(Stream.prototype, EE.prototype);
  ObjectSetPrototypeOf(Stream, EE);
  Stream.prototype.pipe = function(dest, options) {
    const source = this;
    function ondata(chunk) {
      if (dest.writable && dest.write(chunk) === false && source.pause) {
        source.pause();
      }
    }
    source.on("data", ondata);
    function ondrain() {
      if (source.readable && source.resume) {
        source.resume();
      }
    }
    dest.on("drain", ondrain);
    if (!dest._isStdio && (!options || options.end !== false)) {
      source.on("end", onend);
      source.on("close", onclose);
    }
    let didOnEnd = false;
    function onend() {
      if (didOnEnd)
        return;
      didOnEnd = true;
      dest.end();
    }
    function onclose() {
      if (didOnEnd)
        return;
      didOnEnd = true;
      if (typeof dest.destroy === "function")
        dest.destroy();
    }
    function onerror(er) {
      cleanup();
      if (EE.listenerCount(this, "error") === 0) {
        this.emit("error", er);
      }
    }
    prependListener(source, "error", onerror);
    prependListener(dest, "error", onerror);
    function cleanup() {
      source.removeListener("data", ondata);
      dest.removeListener("drain", ondrain);
      source.removeListener("end", onend);
      source.removeListener("close", onclose);
      source.removeListener("error", onerror);
      dest.removeListener("error", onerror);
      source.removeListener("end", cleanup);
      source.removeListener("close", cleanup);
      dest.removeListener("close", cleanup);
    }
    source.on("end", cleanup);
    source.on("close", cleanup);
    dest.on("close", cleanup);
    dest.emit("pipe", source);
    return dest;
  };
  function prependListener(emitter, event, fn) {
    if (typeof emitter.prependListener === "function")
      return emitter.prependListener(event, fn);
    if (!emitter._events || !emitter._events[event])
      emitter.on(event, fn);
    else if (ArrayIsArray(emitter._events[event]))
      emitter._events[event].unshift(fn);
    else
      emitter._events[event] = [fn, emitter._events[event]];
  }
  module.exports = {
    Stream,
    prependListener
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/add-abort-signal.js
var require_add_abort_signal = __commonJS((exports, module) => {
  var { SymbolDispose } = require_primordials();
  var { AbortError, codes } = require_errors();
  var { isNodeStream, isWebStream, kControllerErrorFunction } = require_utils();
  var eos = require_end_of_stream();
  var { ERR_INVALID_ARG_TYPE } = codes;
  var addAbortListener;
  var validateAbortSignal = (signal, name) => {
    if (typeof signal !== "object" || !("aborted" in signal)) {
      throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
    }
  };
  exports.addAbortSignal = function addAbortSignal(signal, stream) {
    validateAbortSignal(signal, "signal");
    if (!isNodeStream(stream) && !isWebStream(stream)) {
      throw new ERR_INVALID_ARG_TYPE("stream", ["ReadableStream", "WritableStream", "Stream"], stream);
    }
    return exports.addAbortSignalNoValidate(signal, stream);
  };
  exports.addAbortSignalNoValidate = function(signal, stream) {
    if (typeof signal !== "object" || !("aborted" in signal)) {
      return stream;
    }
    const onAbort = isNodeStream(stream) ? () => {
      stream.destroy(new AbortError(undefined, {
        cause: signal.reason
      }));
    } : () => {
      stream[kControllerErrorFunction](new AbortError(undefined, {
        cause: signal.reason
      }));
    };
    if (signal.aborted) {
      onAbort();
    } else {
      addAbortListener = addAbortListener || require_util2().addAbortListener;
      const disposable = addAbortListener(signal, onAbort);
      eos(stream, disposable[SymbolDispose]);
    }
    return stream;
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/buffer_list.js
var require_buffer_list = __commonJS((exports, module) => {
  var { StringPrototypeSlice, SymbolIterator, TypedArrayPrototypeSet, Uint8Array: Uint8Array2 } = require_primordials();
  var { Buffer: Buffer2 } = __require("buffer");
  var { inspect } = require_util2();
  module.exports = class BufferList {
    constructor() {
      this.head = null;
      this.tail = null;
      this.length = 0;
    }
    push(v) {
      const entry = {
        data: v,
        next: null
      };
      if (this.length > 0)
        this.tail.next = entry;
      else
        this.head = entry;
      this.tail = entry;
      ++this.length;
    }
    unshift(v) {
      const entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0)
        this.tail = entry;
      this.head = entry;
      ++this.length;
    }
    shift() {
      if (this.length === 0)
        return;
      const ret = this.head.data;
      if (this.length === 1)
        this.head = this.tail = null;
      else
        this.head = this.head.next;
      --this.length;
      return ret;
    }
    clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
    join(s) {
      if (this.length === 0)
        return "";
      let p = this.head;
      let ret = "" + p.data;
      while ((p = p.next) !== null)
        ret += s + p.data;
      return ret;
    }
    concat(n) {
      if (this.length === 0)
        return Buffer2.alloc(0);
      const ret = Buffer2.allocUnsafe(n >>> 0);
      let p = this.head;
      let i = 0;
      while (p) {
        TypedArrayPrototypeSet(ret, p.data, i);
        i += p.data.length;
        p = p.next;
      }
      return ret;
    }
    consume(n, hasStrings) {
      const data = this.head.data;
      if (n < data.length) {
        const slice = data.slice(0, n);
        this.head.data = data.slice(n);
        return slice;
      }
      if (n === data.length) {
        return this.shift();
      }
      return hasStrings ? this._getString(n) : this._getBuffer(n);
    }
    first() {
      return this.head.data;
    }
    *[SymbolIterator]() {
      for (let p = this.head;p; p = p.next) {
        yield p.data;
      }
    }
    _getString(n) {
      let ret = "";
      let p = this.head;
      let c = 0;
      do {
        const str = p.data;
        if (n > str.length) {
          ret += str;
          n -= str.length;
        } else {
          if (n === str.length) {
            ret += str;
            ++c;
            if (p.next)
              this.head = p.next;
            else
              this.head = this.tail = null;
          } else {
            ret += StringPrototypeSlice(str, 0, n);
            this.head = p;
            p.data = StringPrototypeSlice(str, n);
          }
          break;
        }
        ++c;
      } while ((p = p.next) !== null);
      this.length -= c;
      return ret;
    }
    _getBuffer(n) {
      const ret = Buffer2.allocUnsafe(n);
      const retLen = n;
      let p = this.head;
      let c = 0;
      do {
        const buf = p.data;
        if (n > buf.length) {
          TypedArrayPrototypeSet(ret, buf, retLen - n);
          n -= buf.length;
        } else {
          if (n === buf.length) {
            TypedArrayPrototypeSet(ret, buf, retLen - n);
            ++c;
            if (p.next)
              this.head = p.next;
            else
              this.head = this.tail = null;
          } else {
            TypedArrayPrototypeSet(ret, new Uint8Array2(buf.buffer, buf.byteOffset, n), retLen - n);
            this.head = p;
            p.data = buf.slice(n);
          }
          break;
        }
        ++c;
      } while ((p = p.next) !== null);
      this.length -= c;
      return ret;
    }
    [Symbol.for("nodejs.util.inspect.custom")](_2, options) {
      return inspect(this, {
        ...options,
        depth: 0,
        customInspect: false
      });
    }
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/state.js
var require_state = __commonJS((exports, module) => {
  var { MathFloor, NumberIsInteger } = require_primordials();
  var { validateInteger } = require_validators();
  var { ERR_INVALID_ARG_VALUE } = require_errors().codes;
  var defaultHighWaterMarkBytes = 16 * 1024;
  var defaultHighWaterMarkObjectMode = 16;
  function highWaterMarkFrom(options, isDuplex, duplexKey) {
    return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
  }
  function getDefaultHighWaterMark(objectMode) {
    return objectMode ? defaultHighWaterMarkObjectMode : defaultHighWaterMarkBytes;
  }
  function setDefaultHighWaterMark(objectMode, value) {
    validateInteger(value, "value", 0);
    if (objectMode) {
      defaultHighWaterMarkObjectMode = value;
    } else {
      defaultHighWaterMarkBytes = value;
    }
  }
  function getHighWaterMark(state, options, duplexKey, isDuplex) {
    const hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
    if (hwm != null) {
      if (!NumberIsInteger(hwm) || hwm < 0) {
        const name = isDuplex ? `options.${duplexKey}` : "options.highWaterMark";
        throw new ERR_INVALID_ARG_VALUE(name, hwm);
      }
      return MathFloor(hwm);
    }
    return getDefaultHighWaterMark(state.objectMode);
  }
  module.exports = {
    getHighWaterMark,
    getDefaultHighWaterMark,
    setDefaultHighWaterMark
  };
});

// ../../node_modules/.pnpm/safe-buffer@5.2.1/node_modules/safe-buffer/index.js
var require_safe_buffer2 = __commonJS((exports, module) => {
  /*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
  var buffer = __require("buffer");
  var Buffer2 = buffer.Buffer;
  function copyProps(src, dst) {
    for (var key in src) {
      dst[key] = src[key];
    }
  }
  if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
    module.exports = buffer;
  } else {
    copyProps(buffer, exports);
    exports.Buffer = SafeBuffer;
  }
  function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer2(arg, encodingOrOffset, length);
  }
  SafeBuffer.prototype = Object.create(Buffer2.prototype);
  copyProps(Buffer2, SafeBuffer);
  SafeBuffer.from = function(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      throw new TypeError("Argument must not be a number");
    }
    return Buffer2(arg, encodingOrOffset, length);
  };
  SafeBuffer.alloc = function(size, fill, encoding) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    var buf = Buffer2(size);
    if (fill !== undefined) {
      if (typeof encoding === "string") {
        buf.fill(fill, encoding);
      } else {
        buf.fill(fill);
      }
    } else {
      buf.fill(0);
    }
    return buf;
  };
  SafeBuffer.allocUnsafe = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return Buffer2(size);
  };
  SafeBuffer.allocUnsafeSlow = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return buffer.SlowBuffer(size);
  };
});

// ../../node_modules/.pnpm/string_decoder@1.3.0/node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder2 = __commonJS((exports) => {
  var Buffer2 = require_safe_buffer2().Buffer;
  var isEncoding = Buffer2.isEncoding || function(encoding) {
    encoding = "" + encoding;
    switch (encoding && encoding.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return true;
      default:
        return false;
    }
  };
  function _normalizeEncoding(enc) {
    if (!enc)
      return "utf8";
    var retried;
    while (true) {
      switch (enc) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return enc;
        default:
          if (retried)
            return;
          enc = ("" + enc).toLowerCase();
          retried = true;
      }
    }
  }
  function normalizeEncoding(enc) {
    var nenc = _normalizeEncoding(enc);
    if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc)))
      throw new Error("Unknown encoding: " + enc);
    return nenc || enc;
  }
  exports.StringDecoder = StringDecoder;
  function StringDecoder(encoding) {
    this.encoding = normalizeEncoding(encoding);
    var nb;
    switch (this.encoding) {
      case "utf16le":
        this.text = utf16Text;
        this.end = utf16End;
        nb = 4;
        break;
      case "utf8":
        this.fillLast = utf8FillLast;
        nb = 4;
        break;
      case "base64":
        this.text = base64Text;
        this.end = base64End;
        nb = 3;
        break;
      default:
        this.write = simpleWrite;
        this.end = simpleEnd;
        return;
    }
    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = Buffer2.allocUnsafe(nb);
  }
  StringDecoder.prototype.write = function(buf) {
    if (buf.length === 0)
      return "";
    var r;
    var i;
    if (this.lastNeed) {
      r = this.fillLast(buf);
      if (r === undefined)
        return "";
      i = this.lastNeed;
      this.lastNeed = 0;
    } else {
      i = 0;
    }
    if (i < buf.length)
      return r ? r + this.text(buf, i) : this.text(buf, i);
    return r || "";
  };
  StringDecoder.prototype.end = utf8End;
  StringDecoder.prototype.text = utf8Text;
  StringDecoder.prototype.fillLast = function(buf) {
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
    this.lastNeed -= buf.length;
  };
  function utf8CheckByte(byte) {
    if (byte <= 127)
      return 0;
    else if (byte >> 5 === 6)
      return 2;
    else if (byte >> 4 === 14)
      return 3;
    else if (byte >> 3 === 30)
      return 4;
    return byte >> 6 === 2 ? -1 : -2;
  }
  function utf8CheckIncomplete(self2, buf, i) {
    var j = buf.length - 1;
    if (j < i)
      return 0;
    var nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0)
        self2.lastNeed = nb - 1;
      return nb;
    }
    if (--j < i || nb === -2)
      return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0)
        self2.lastNeed = nb - 2;
      return nb;
    }
    if (--j < i || nb === -2)
      return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) {
        if (nb === 2)
          nb = 0;
        else
          self2.lastNeed = nb - 3;
      }
      return nb;
    }
    return 0;
  }
  function utf8CheckExtraBytes(self2, buf, p) {
    if ((buf[0] & 192) !== 128) {
      self2.lastNeed = 0;
      return "�";
    }
    if (self2.lastNeed > 1 && buf.length > 1) {
      if ((buf[1] & 192) !== 128) {
        self2.lastNeed = 1;
        return "�";
      }
      if (self2.lastNeed > 2 && buf.length > 2) {
        if ((buf[2] & 192) !== 128) {
          self2.lastNeed = 2;
          return "�";
        }
      }
    }
  }
  function utf8FillLast(buf) {
    var p = this.lastTotal - this.lastNeed;
    var r = utf8CheckExtraBytes(this, buf, p);
    if (r !== undefined)
      return r;
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, p, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, p, 0, buf.length);
    this.lastNeed -= buf.length;
  }
  function utf8Text(buf, i) {
    var total = utf8CheckIncomplete(this, buf, i);
    if (!this.lastNeed)
      return buf.toString("utf8", i);
    this.lastTotal = total;
    var end = buf.length - (total - this.lastNeed);
    buf.copy(this.lastChar, 0, end);
    return buf.toString("utf8", i, end);
  }
  function utf8End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed)
      return r + "�";
    return r;
  }
  function utf16Text(buf, i) {
    if ((buf.length - i) % 2 === 0) {
      var r = buf.toString("utf16le", i);
      if (r) {
        var c = r.charCodeAt(r.length - 1);
        if (c >= 55296 && c <= 56319) {
          this.lastNeed = 2;
          this.lastTotal = 4;
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
          return r.slice(0, -1);
        }
      }
      return r;
    }
    this.lastNeed = 1;
    this.lastTotal = 2;
    this.lastChar[0] = buf[buf.length - 1];
    return buf.toString("utf16le", i, buf.length - 1);
  }
  function utf16End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) {
      var end = this.lastTotal - this.lastNeed;
      return r + this.lastChar.toString("utf16le", 0, end);
    }
    return r;
  }
  function base64Text(buf, i) {
    var n = (buf.length - i) % 3;
    if (n === 0)
      return buf.toString("base64", i);
    this.lastNeed = 3 - n;
    this.lastTotal = 3;
    if (n === 1) {
      this.lastChar[0] = buf[buf.length - 1];
    } else {
      this.lastChar[0] = buf[buf.length - 2];
      this.lastChar[1] = buf[buf.length - 1];
    }
    return buf.toString("base64", i, buf.length - n);
  }
  function base64End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed)
      return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
    return r;
  }
  function simpleWrite(buf) {
    return buf.toString(this.encoding);
  }
  function simpleEnd(buf) {
    return buf && buf.length ? this.write(buf) : "";
  }
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/from.js
var require_from = __commonJS((exports, module) => {
  var process2 = require_process();
  var { PromisePrototypeThen, SymbolAsyncIterator, SymbolIterator } = require_primordials();
  var { Buffer: Buffer2 } = __require("buffer");
  var { ERR_INVALID_ARG_TYPE, ERR_STREAM_NULL_VALUES } = require_errors().codes;
  function from(Readable, iterable, opts) {
    let iterator;
    if (typeof iterable === "string" || iterable instanceof Buffer2) {
      return new Readable({
        objectMode: true,
        ...opts,
        read() {
          this.push(iterable);
          this.push(null);
        }
      });
    }
    let isAsync;
    if (iterable && iterable[SymbolAsyncIterator]) {
      isAsync = true;
      iterator = iterable[SymbolAsyncIterator]();
    } else if (iterable && iterable[SymbolIterator]) {
      isAsync = false;
      iterator = iterable[SymbolIterator]();
    } else {
      throw new ERR_INVALID_ARG_TYPE("iterable", ["Iterable"], iterable);
    }
    const readable = new Readable({
      objectMode: true,
      highWaterMark: 1,
      ...opts
    });
    let reading = false;
    readable._read = function() {
      if (!reading) {
        reading = true;
        next();
      }
    };
    readable._destroy = function(error, cb) {
      PromisePrototypeThen(close(error), () => process2.nextTick(cb, error), (e) => process2.nextTick(cb, e || error));
    };
    async function close(error) {
      const hadError = error !== undefined && error !== null;
      const hasThrow = typeof iterator.throw === "function";
      if (hadError && hasThrow) {
        const { value, done } = await iterator.throw(error);
        await value;
        if (done) {
          return;
        }
      }
      if (typeof iterator.return === "function") {
        const { value } = await iterator.return();
        await value;
      }
    }
    async function next() {
      for (;; ) {
        try {
          const { value, done } = isAsync ? await iterator.next() : iterator.next();
          if (done) {
            readable.push(null);
          } else {
            const res = value && typeof value.then === "function" ? await value : value;
            if (res === null) {
              reading = false;
              throw new ERR_STREAM_NULL_VALUES;
            } else if (readable.push(res)) {
              continue;
            } else {
              reading = false;
            }
          }
        } catch (err) {
          readable.destroy(err);
        }
        break;
      }
    }
    return readable;
  }
  module.exports = from;
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/readable.js
var require_readable2 = __commonJS((exports, module) => {
  var process2 = require_process();
  var {
    ArrayPrototypeIndexOf,
    NumberIsInteger,
    NumberIsNaN,
    NumberParseInt,
    ObjectDefineProperties,
    ObjectKeys,
    ObjectSetPrototypeOf,
    Promise: Promise2,
    SafeSet,
    SymbolAsyncDispose,
    SymbolAsyncIterator,
    Symbol: Symbol2
  } = require_primordials();
  module.exports = Readable;
  Readable.ReadableState = ReadableState;
  var { EventEmitter: EE } = __require("events");
  var { Stream, prependListener } = require_legacy();
  var { Buffer: Buffer2 } = __require("buffer");
  var { addAbortSignal } = require_add_abort_signal();
  var eos = require_end_of_stream();
  var debug = require_util2().debuglog("stream", (fn) => {
    debug = fn;
  });
  var BufferList = require_buffer_list();
  var destroyImpl = require_destroy2();
  var { getHighWaterMark, getDefaultHighWaterMark } = require_state();
  var {
    aggregateTwoErrors,
    codes: {
      ERR_INVALID_ARG_TYPE,
      ERR_METHOD_NOT_IMPLEMENTED,
      ERR_OUT_OF_RANGE,
      ERR_STREAM_PUSH_AFTER_EOF,
      ERR_STREAM_UNSHIFT_AFTER_END_EVENT
    },
    AbortError
  } = require_errors();
  var { validateObject } = require_validators();
  var kPaused = Symbol2("kPaused");
  var { StringDecoder } = require_string_decoder2();
  var from = require_from();
  ObjectSetPrototypeOf(Readable.prototype, Stream.prototype);
  ObjectSetPrototypeOf(Readable, Stream);
  var nop = () => {};
  var { errorOrDestroy } = destroyImpl;
  var kObjectMode = 1 << 0;
  var kEnded = 1 << 1;
  var kEndEmitted = 1 << 2;
  var kReading = 1 << 3;
  var kConstructed = 1 << 4;
  var kSync = 1 << 5;
  var kNeedReadable = 1 << 6;
  var kEmittedReadable = 1 << 7;
  var kReadableListening = 1 << 8;
  var kResumeScheduled = 1 << 9;
  var kErrorEmitted = 1 << 10;
  var kEmitClose = 1 << 11;
  var kAutoDestroy = 1 << 12;
  var kDestroyed = 1 << 13;
  var kClosed = 1 << 14;
  var kCloseEmitted = 1 << 15;
  var kMultiAwaitDrain = 1 << 16;
  var kReadingMore = 1 << 17;
  var kDataEmitted = 1 << 18;
  function makeBitMapDescriptor(bit) {
    return {
      enumerable: false,
      get() {
        return (this.state & bit) !== 0;
      },
      set(value) {
        if (value)
          this.state |= bit;
        else
          this.state &= ~bit;
      }
    };
  }
  ObjectDefineProperties(ReadableState.prototype, {
    objectMode: makeBitMapDescriptor(kObjectMode),
    ended: makeBitMapDescriptor(kEnded),
    endEmitted: makeBitMapDescriptor(kEndEmitted),
    reading: makeBitMapDescriptor(kReading),
    constructed: makeBitMapDescriptor(kConstructed),
    sync: makeBitMapDescriptor(kSync),
    needReadable: makeBitMapDescriptor(kNeedReadable),
    emittedReadable: makeBitMapDescriptor(kEmittedReadable),
    readableListening: makeBitMapDescriptor(kReadableListening),
    resumeScheduled: makeBitMapDescriptor(kResumeScheduled),
    errorEmitted: makeBitMapDescriptor(kErrorEmitted),
    emitClose: makeBitMapDescriptor(kEmitClose),
    autoDestroy: makeBitMapDescriptor(kAutoDestroy),
    destroyed: makeBitMapDescriptor(kDestroyed),
    closed: makeBitMapDescriptor(kClosed),
    closeEmitted: makeBitMapDescriptor(kCloseEmitted),
    multiAwaitDrain: makeBitMapDescriptor(kMultiAwaitDrain),
    readingMore: makeBitMapDescriptor(kReadingMore),
    dataEmitted: makeBitMapDescriptor(kDataEmitted)
  });
  function ReadableState(options, stream, isDuplex) {
    if (typeof isDuplex !== "boolean")
      isDuplex = stream instanceof require_duplex();
    this.state = kEmitClose | kAutoDestroy | kConstructed | kSync;
    if (options && options.objectMode)
      this.state |= kObjectMode;
    if (isDuplex && options && options.readableObjectMode)
      this.state |= kObjectMode;
    this.highWaterMark = options ? getHighWaterMark(this, options, "readableHighWaterMark", isDuplex) : getDefaultHighWaterMark(false);
    this.buffer = new BufferList;
    this.length = 0;
    this.pipes = [];
    this.flowing = null;
    this[kPaused] = null;
    if (options && options.emitClose === false)
      this.state &= ~kEmitClose;
    if (options && options.autoDestroy === false)
      this.state &= ~kAutoDestroy;
    this.errored = null;
    this.defaultEncoding = options && options.defaultEncoding || "utf8";
    this.awaitDrainWriters = null;
    this.decoder = null;
    this.encoding = null;
    if (options && options.encoding) {
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  function Readable(options) {
    if (!(this instanceof Readable))
      return new Readable(options);
    const isDuplex = this instanceof require_duplex();
    this._readableState = new ReadableState(options, this, isDuplex);
    if (options) {
      if (typeof options.read === "function")
        this._read = options.read;
      if (typeof options.destroy === "function")
        this._destroy = options.destroy;
      if (typeof options.construct === "function")
        this._construct = options.construct;
      if (options.signal && !isDuplex)
        addAbortSignal(options.signal, this);
    }
    Stream.call(this, options);
    destroyImpl.construct(this, () => {
      if (this._readableState.needReadable) {
        maybeReadMore(this, this._readableState);
      }
    });
  }
  Readable.prototype.destroy = destroyImpl.destroy;
  Readable.prototype._undestroy = destroyImpl.undestroy;
  Readable.prototype._destroy = function(err, cb) {
    cb(err);
  };
  Readable.prototype[EE.captureRejectionSymbol] = function(err) {
    this.destroy(err);
  };
  Readable.prototype[SymbolAsyncDispose] = function() {
    let error;
    if (!this.destroyed) {
      error = this.readableEnded ? null : new AbortError;
      this.destroy(error);
    }
    return new Promise2((resolve, reject) => eos(this, (err) => err && err !== error ? reject(err) : resolve(null)));
  };
  Readable.prototype.push = function(chunk, encoding) {
    return readableAddChunk(this, chunk, encoding, false);
  };
  Readable.prototype.unshift = function(chunk, encoding) {
    return readableAddChunk(this, chunk, encoding, true);
  };
  function readableAddChunk(stream, chunk, encoding, addToFront) {
    debug("readableAddChunk", chunk);
    const state = stream._readableState;
    let err;
    if ((state.state & kObjectMode) === 0) {
      if (typeof chunk === "string") {
        encoding = encoding || state.defaultEncoding;
        if (state.encoding !== encoding) {
          if (addToFront && state.encoding) {
            chunk = Buffer2.from(chunk, encoding).toString(state.encoding);
          } else {
            chunk = Buffer2.from(chunk, encoding);
            encoding = "";
          }
        }
      } else if (chunk instanceof Buffer2) {
        encoding = "";
      } else if (Stream._isUint8Array(chunk)) {
        chunk = Stream._uint8ArrayToBuffer(chunk);
        encoding = "";
      } else if (chunk != null) {
        err = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
      }
    }
    if (err) {
      errorOrDestroy(stream, err);
    } else if (chunk === null) {
      state.state &= ~kReading;
      onEofChunk(stream, state);
    } else if ((state.state & kObjectMode) !== 0 || chunk && chunk.length > 0) {
      if (addToFront) {
        if ((state.state & kEndEmitted) !== 0)
          errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT);
        else if (state.destroyed || state.errored)
          return false;
        else
          addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF);
      } else if (state.destroyed || state.errored) {
        return false;
      } else {
        state.state &= ~kReading;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0)
            addChunk(stream, state, chunk, false);
          else
            maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.state &= ~kReading;
      maybeReadMore(stream, state);
    }
    return !state.ended && (state.length < state.highWaterMark || state.length === 0);
  }
  function addChunk(stream, state, chunk, addToFront) {
    if (state.flowing && state.length === 0 && !state.sync && stream.listenerCount("data") > 0) {
      if ((state.state & kMultiAwaitDrain) !== 0) {
        state.awaitDrainWriters.clear();
      } else {
        state.awaitDrainWriters = null;
      }
      state.dataEmitted = true;
      stream.emit("data", chunk);
    } else {
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront)
        state.buffer.unshift(chunk);
      else
        state.buffer.push(chunk);
      if ((state.state & kNeedReadable) !== 0)
        emitReadable(stream);
    }
    maybeReadMore(stream, state);
  }
  Readable.prototype.isPaused = function() {
    const state = this._readableState;
    return state[kPaused] === true || state.flowing === false;
  };
  Readable.prototype.setEncoding = function(enc) {
    const decoder = new StringDecoder(enc);
    this._readableState.decoder = decoder;
    this._readableState.encoding = this._readableState.decoder.encoding;
    const buffer = this._readableState.buffer;
    let content = "";
    for (const data of buffer) {
      content += decoder.write(data);
    }
    buffer.clear();
    if (content !== "")
      buffer.push(content);
    this._readableState.length = content.length;
    return this;
  };
  var MAX_HWM = 1073741824;
  function computeNewHighWaterMark(n) {
    if (n > MAX_HWM) {
      throw new ERR_OUT_OF_RANGE("size", "<= 1GiB", n);
    } else {
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }
  function howMuchToRead(n, state) {
    if (n <= 0 || state.length === 0 && state.ended)
      return 0;
    if ((state.state & kObjectMode) !== 0)
      return 1;
    if (NumberIsNaN(n)) {
      if (state.flowing && state.length)
        return state.buffer.first().length;
      return state.length;
    }
    if (n <= state.length)
      return n;
    return state.ended ? state.length : 0;
  }
  Readable.prototype.read = function(n) {
    debug("read", n);
    if (n === undefined) {
      n = NaN;
    } else if (!NumberIsInteger(n)) {
      n = NumberParseInt(n, 10);
    }
    const state = this._readableState;
    const nOrig = n;
    if (n > state.highWaterMark)
      state.highWaterMark = computeNewHighWaterMark(n);
    if (n !== 0)
      state.state &= ~kEmittedReadable;
    if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
      debug("read: emitReadable", state.length, state.ended);
      if (state.length === 0 && state.ended)
        endReadable(this);
      else
        emitReadable(this);
      return null;
    }
    n = howMuchToRead(n, state);
    if (n === 0 && state.ended) {
      if (state.length === 0)
        endReadable(this);
      return null;
    }
    let doRead = (state.state & kNeedReadable) !== 0;
    debug("need readable", doRead);
    if (state.length === 0 || state.length - n < state.highWaterMark) {
      doRead = true;
      debug("length less than watermark", doRead);
    }
    if (state.ended || state.reading || state.destroyed || state.errored || !state.constructed) {
      doRead = false;
      debug("reading, ended or constructing", doRead);
    } else if (doRead) {
      debug("do read");
      state.state |= kReading | kSync;
      if (state.length === 0)
        state.state |= kNeedReadable;
      try {
        this._read(state.highWaterMark);
      } catch (err) {
        errorOrDestroy(this, err);
      }
      state.state &= ~kSync;
      if (!state.reading)
        n = howMuchToRead(nOrig, state);
    }
    let ret;
    if (n > 0)
      ret = fromList(n, state);
    else
      ret = null;
    if (ret === null) {
      state.needReadable = state.length <= state.highWaterMark;
      n = 0;
    } else {
      state.length -= n;
      if (state.multiAwaitDrain) {
        state.awaitDrainWriters.clear();
      } else {
        state.awaitDrainWriters = null;
      }
    }
    if (state.length === 0) {
      if (!state.ended)
        state.needReadable = true;
      if (nOrig !== n && state.ended)
        endReadable(this);
    }
    if (ret !== null && !state.errorEmitted && !state.closeEmitted) {
      state.dataEmitted = true;
      this.emit("data", ret);
    }
    return ret;
  };
  function onEofChunk(stream, state) {
    debug("onEofChunk");
    if (state.ended)
      return;
    if (state.decoder) {
      const chunk = state.decoder.end();
      if (chunk && chunk.length) {
        state.buffer.push(chunk);
        state.length += state.objectMode ? 1 : chunk.length;
      }
    }
    state.ended = true;
    if (state.sync) {
      emitReadable(stream);
    } else {
      state.needReadable = false;
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
  function emitReadable(stream) {
    const state = stream._readableState;
    debug("emitReadable", state.needReadable, state.emittedReadable);
    state.needReadable = false;
    if (!state.emittedReadable) {
      debug("emitReadable", state.flowing);
      state.emittedReadable = true;
      process2.nextTick(emitReadable_, stream);
    }
  }
  function emitReadable_(stream) {
    const state = stream._readableState;
    debug("emitReadable_", state.destroyed, state.length, state.ended);
    if (!state.destroyed && !state.errored && (state.length || state.ended)) {
      stream.emit("readable");
      state.emittedReadable = false;
    }
    state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
    flow(stream);
  }
  function maybeReadMore(stream, state) {
    if (!state.readingMore && state.constructed) {
      state.readingMore = true;
      process2.nextTick(maybeReadMore_, stream, state);
    }
  }
  function maybeReadMore_(stream, state) {
    while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
      const len = state.length;
      debug("maybeReadMore read 0");
      stream.read(0);
      if (len === state.length)
        break;
    }
    state.readingMore = false;
  }
  Readable.prototype._read = function(n) {
    throw new ERR_METHOD_NOT_IMPLEMENTED("_read()");
  };
  Readable.prototype.pipe = function(dest, pipeOpts) {
    const src = this;
    const state = this._readableState;
    if (state.pipes.length === 1) {
      if (!state.multiAwaitDrain) {
        state.multiAwaitDrain = true;
        state.awaitDrainWriters = new SafeSet(state.awaitDrainWriters ? [state.awaitDrainWriters] : []);
      }
    }
    state.pipes.push(dest);
    debug("pipe count=%d opts=%j", state.pipes.length, pipeOpts);
    const doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process2.stdout && dest !== process2.stderr;
    const endFn = doEnd ? onend : unpipe;
    if (state.endEmitted)
      process2.nextTick(endFn);
    else
      src.once("end", endFn);
    dest.on("unpipe", onunpipe);
    function onunpipe(readable, unpipeInfo) {
      debug("onunpipe");
      if (readable === src) {
        if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
          unpipeInfo.hasUnpiped = true;
          cleanup();
        }
      }
    }
    function onend() {
      debug("onend");
      dest.end();
    }
    let ondrain;
    let cleanedUp = false;
    function cleanup() {
      debug("cleanup");
      dest.removeListener("close", onclose);
      dest.removeListener("finish", onfinish);
      if (ondrain) {
        dest.removeListener("drain", ondrain);
      }
      dest.removeListener("error", onerror);
      dest.removeListener("unpipe", onunpipe);
      src.removeListener("end", onend);
      src.removeListener("end", unpipe);
      src.removeListener("data", ondata);
      cleanedUp = true;
      if (ondrain && state.awaitDrainWriters && (!dest._writableState || dest._writableState.needDrain))
        ondrain();
    }
    function pause() {
      if (!cleanedUp) {
        if (state.pipes.length === 1 && state.pipes[0] === dest) {
          debug("false write response, pause", 0);
          state.awaitDrainWriters = dest;
          state.multiAwaitDrain = false;
        } else if (state.pipes.length > 1 && state.pipes.includes(dest)) {
          debug("false write response, pause", state.awaitDrainWriters.size);
          state.awaitDrainWriters.add(dest);
        }
        src.pause();
      }
      if (!ondrain) {
        ondrain = pipeOnDrain(src, dest);
        dest.on("drain", ondrain);
      }
    }
    src.on("data", ondata);
    function ondata(chunk) {
      debug("ondata");
      const ret = dest.write(chunk);
      debug("dest.write", ret);
      if (ret === false) {
        pause();
      }
    }
    function onerror(er) {
      debug("onerror", er);
      unpipe();
      dest.removeListener("error", onerror);
      if (dest.listenerCount("error") === 0) {
        const s = dest._writableState || dest._readableState;
        if (s && !s.errorEmitted) {
          errorOrDestroy(dest, er);
        } else {
          dest.emit("error", er);
        }
      }
    }
    prependListener(dest, "error", onerror);
    function onclose() {
      dest.removeListener("finish", onfinish);
      unpipe();
    }
    dest.once("close", onclose);
    function onfinish() {
      debug("onfinish");
      dest.removeListener("close", onclose);
      unpipe();
    }
    dest.once("finish", onfinish);
    function unpipe() {
      debug("unpipe");
      src.unpipe(dest);
    }
    dest.emit("pipe", src);
    if (dest.writableNeedDrain === true) {
      pause();
    } else if (!state.flowing) {
      debug("pipe resume");
      src.resume();
    }
    return dest;
  };
  function pipeOnDrain(src, dest) {
    return function pipeOnDrainFunctionResult() {
      const state = src._readableState;
      if (state.awaitDrainWriters === dest) {
        debug("pipeOnDrain", 1);
        state.awaitDrainWriters = null;
      } else if (state.multiAwaitDrain) {
        debug("pipeOnDrain", state.awaitDrainWriters.size);
        state.awaitDrainWriters.delete(dest);
      }
      if ((!state.awaitDrainWriters || state.awaitDrainWriters.size === 0) && src.listenerCount("data")) {
        src.resume();
      }
    };
  }
  Readable.prototype.unpipe = function(dest) {
    const state = this._readableState;
    const unpipeInfo = {
      hasUnpiped: false
    };
    if (state.pipes.length === 0)
      return this;
    if (!dest) {
      const dests = state.pipes;
      state.pipes = [];
      this.pause();
      for (let i = 0;i < dests.length; i++)
        dests[i].emit("unpipe", this, {
          hasUnpiped: false
        });
      return this;
    }
    const index = ArrayPrototypeIndexOf(state.pipes, dest);
    if (index === -1)
      return this;
    state.pipes.splice(index, 1);
    if (state.pipes.length === 0)
      this.pause();
    dest.emit("unpipe", this, unpipeInfo);
    return this;
  };
  Readable.prototype.on = function(ev, fn) {
    const res = Stream.prototype.on.call(this, ev, fn);
    const state = this._readableState;
    if (ev === "data") {
      state.readableListening = this.listenerCount("readable") > 0;
      if (state.flowing !== false)
        this.resume();
    } else if (ev === "readable") {
      if (!state.endEmitted && !state.readableListening) {
        state.readableListening = state.needReadable = true;
        state.flowing = false;
        state.emittedReadable = false;
        debug("on readable", state.length, state.reading);
        if (state.length) {
          emitReadable(this);
        } else if (!state.reading) {
          process2.nextTick(nReadingNextTick, this);
        }
      }
    }
    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;
  Readable.prototype.removeListener = function(ev, fn) {
    const res = Stream.prototype.removeListener.call(this, ev, fn);
    if (ev === "readable") {
      process2.nextTick(updateReadableListening, this);
    }
    return res;
  };
  Readable.prototype.off = Readable.prototype.removeListener;
  Readable.prototype.removeAllListeners = function(ev) {
    const res = Stream.prototype.removeAllListeners.apply(this, arguments);
    if (ev === "readable" || ev === undefined) {
      process2.nextTick(updateReadableListening, this);
    }
    return res;
  };
  function updateReadableListening(self2) {
    const state = self2._readableState;
    state.readableListening = self2.listenerCount("readable") > 0;
    if (state.resumeScheduled && state[kPaused] === false) {
      state.flowing = true;
    } else if (self2.listenerCount("data") > 0) {
      self2.resume();
    } else if (!state.readableListening) {
      state.flowing = null;
    }
  }
  function nReadingNextTick(self2) {
    debug("readable nexttick read 0");
    self2.read(0);
  }
  Readable.prototype.resume = function() {
    const state = this._readableState;
    if (!state.flowing) {
      debug("resume");
      state.flowing = !state.readableListening;
      resume(this, state);
    }
    state[kPaused] = false;
    return this;
  };
  function resume(stream, state) {
    if (!state.resumeScheduled) {
      state.resumeScheduled = true;
      process2.nextTick(resume_, stream, state);
    }
  }
  function resume_(stream, state) {
    debug("resume", state.reading);
    if (!state.reading) {
      stream.read(0);
    }
    state.resumeScheduled = false;
    stream.emit("resume");
    flow(stream);
    if (state.flowing && !state.reading)
      stream.read(0);
  }
  Readable.prototype.pause = function() {
    debug("call pause flowing=%j", this._readableState.flowing);
    if (this._readableState.flowing !== false) {
      debug("pause");
      this._readableState.flowing = false;
      this.emit("pause");
    }
    this._readableState[kPaused] = true;
    return this;
  };
  function flow(stream) {
    const state = stream._readableState;
    debug("flow", state.flowing);
    while (state.flowing && stream.read() !== null)
      ;
  }
  Readable.prototype.wrap = function(stream) {
    let paused = false;
    stream.on("data", (chunk) => {
      if (!this.push(chunk) && stream.pause) {
        paused = true;
        stream.pause();
      }
    });
    stream.on("end", () => {
      this.push(null);
    });
    stream.on("error", (err) => {
      errorOrDestroy(this, err);
    });
    stream.on("close", () => {
      this.destroy();
    });
    stream.on("destroy", () => {
      this.destroy();
    });
    this._read = () => {
      if (paused && stream.resume) {
        paused = false;
        stream.resume();
      }
    };
    const streamKeys = ObjectKeys(stream);
    for (let j = 1;j < streamKeys.length; j++) {
      const i = streamKeys[j];
      if (this[i] === undefined && typeof stream[i] === "function") {
        this[i] = stream[i].bind(stream);
      }
    }
    return this;
  };
  Readable.prototype[SymbolAsyncIterator] = function() {
    return streamToAsyncIterator(this);
  };
  Readable.prototype.iterator = function(options) {
    if (options !== undefined) {
      validateObject(options, "options");
    }
    return streamToAsyncIterator(this, options);
  };
  function streamToAsyncIterator(stream, options) {
    if (typeof stream.read !== "function") {
      stream = Readable.wrap(stream, {
        objectMode: true
      });
    }
    const iter = createAsyncIterator(stream, options);
    iter.stream = stream;
    return iter;
  }
  async function* createAsyncIterator(stream, options) {
    let callback = nop;
    function next(resolve) {
      if (this === stream) {
        callback();
        callback = nop;
      } else {
        callback = resolve;
      }
    }
    stream.on("readable", next);
    let error;
    const cleanup = eos(stream, {
      writable: false
    }, (err) => {
      error = err ? aggregateTwoErrors(error, err) : null;
      callback();
      callback = nop;
    });
    try {
      while (true) {
        const chunk = stream.destroyed ? null : stream.read();
        if (chunk !== null) {
          yield chunk;
        } else if (error) {
          throw error;
        } else if (error === null) {
          return;
        } else {
          await new Promise2(next);
        }
      }
    } catch (err) {
      error = aggregateTwoErrors(error, err);
      throw error;
    } finally {
      if ((error || (options === null || options === undefined ? undefined : options.destroyOnReturn) !== false) && (error === undefined || stream._readableState.autoDestroy)) {
        destroyImpl.destroyer(stream, null);
      } else {
        stream.off("readable", next);
        cleanup();
      }
    }
  }
  ObjectDefineProperties(Readable.prototype, {
    readable: {
      __proto__: null,
      get() {
        const r = this._readableState;
        return !!r && r.readable !== false && !r.destroyed && !r.errorEmitted && !r.endEmitted;
      },
      set(val) {
        if (this._readableState) {
          this._readableState.readable = !!val;
        }
      }
    },
    readableDidRead: {
      __proto__: null,
      enumerable: false,
      get: function() {
        return this._readableState.dataEmitted;
      }
    },
    readableAborted: {
      __proto__: null,
      enumerable: false,
      get: function() {
        return !!(this._readableState.readable !== false && (this._readableState.destroyed || this._readableState.errored) && !this._readableState.endEmitted);
      }
    },
    readableHighWaterMark: {
      __proto__: null,
      enumerable: false,
      get: function() {
        return this._readableState.highWaterMark;
      }
    },
    readableBuffer: {
      __proto__: null,
      enumerable: false,
      get: function() {
        return this._readableState && this._readableState.buffer;
      }
    },
    readableFlowing: {
      __proto__: null,
      enumerable: false,
      get: function() {
        return this._readableState.flowing;
      },
      set: function(state) {
        if (this._readableState) {
          this._readableState.flowing = state;
        }
      }
    },
    readableLength: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._readableState.length;
      }
    },
    readableObjectMode: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._readableState ? this._readableState.objectMode : false;
      }
    },
    readableEncoding: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._readableState ? this._readableState.encoding : null;
      }
    },
    errored: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._readableState ? this._readableState.errored : null;
      }
    },
    closed: {
      __proto__: null,
      get() {
        return this._readableState ? this._readableState.closed : false;
      }
    },
    destroyed: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._readableState ? this._readableState.destroyed : false;
      },
      set(value) {
        if (!this._readableState) {
          return;
        }
        this._readableState.destroyed = value;
      }
    },
    readableEnded: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._readableState ? this._readableState.endEmitted : false;
      }
    }
  });
  ObjectDefineProperties(ReadableState.prototype, {
    pipesCount: {
      __proto__: null,
      get() {
        return this.pipes.length;
      }
    },
    paused: {
      __proto__: null,
      get() {
        return this[kPaused] !== false;
      },
      set(value) {
        this[kPaused] = !!value;
      }
    }
  });
  Readable._fromList = fromList;
  function fromList(n, state) {
    if (state.length === 0)
      return null;
    let ret;
    if (state.objectMode)
      ret = state.buffer.shift();
    else if (!n || n >= state.length) {
      if (state.decoder)
        ret = state.buffer.join("");
      else if (state.buffer.length === 1)
        ret = state.buffer.first();
      else
        ret = state.buffer.concat(state.length);
      state.buffer.clear();
    } else {
      ret = state.buffer.consume(n, state.decoder);
    }
    return ret;
  }
  function endReadable(stream) {
    const state = stream._readableState;
    debug("endReadable", state.endEmitted);
    if (!state.endEmitted) {
      state.ended = true;
      process2.nextTick(endReadableNT, state, stream);
    }
  }
  function endReadableNT(state, stream) {
    debug("endReadableNT", state.endEmitted, state.length);
    if (!state.errored && !state.closeEmitted && !state.endEmitted && state.length === 0) {
      state.endEmitted = true;
      stream.emit("end");
      if (stream.writable && stream.allowHalfOpen === false) {
        process2.nextTick(endWritableNT, stream);
      } else if (state.autoDestroy) {
        const wState = stream._writableState;
        const autoDestroy = !wState || wState.autoDestroy && (wState.finished || wState.writable === false);
        if (autoDestroy) {
          stream.destroy();
        }
      }
    }
  }
  function endWritableNT(stream) {
    const writable = stream.writable && !stream.writableEnded && !stream.destroyed;
    if (writable) {
      stream.end();
    }
  }
  Readable.from = function(iterable, opts) {
    return from(Readable, iterable, opts);
  };
  var webStreamsAdapters;
  function lazyWebStreams() {
    if (webStreamsAdapters === undefined)
      webStreamsAdapters = {};
    return webStreamsAdapters;
  }
  Readable.fromWeb = function(readableStream, options) {
    return lazyWebStreams().newStreamReadableFromReadableStream(readableStream, options);
  };
  Readable.toWeb = function(streamReadable, options) {
    return lazyWebStreams().newReadableStreamFromStreamReadable(streamReadable, options);
  };
  Readable.wrap = function(src, options) {
    var _ref, _src$readableObjectMo;
    return new Readable({
      objectMode: (_ref = (_src$readableObjectMo = src.readableObjectMode) !== null && _src$readableObjectMo !== undefined ? _src$readableObjectMo : src.objectMode) !== null && _ref !== undefined ? _ref : true,
      ...options,
      destroy(err, callback) {
        destroyImpl.destroyer(src, err);
        callback(err);
      }
    }).wrap(src);
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/writable.js
var require_writable = __commonJS((exports, module) => {
  var process2 = require_process();
  var {
    ArrayPrototypeSlice,
    Error: Error2,
    FunctionPrototypeSymbolHasInstance,
    ObjectDefineProperty,
    ObjectDefineProperties,
    ObjectSetPrototypeOf,
    StringPrototypeToLowerCase,
    Symbol: Symbol2,
    SymbolHasInstance
  } = require_primordials();
  module.exports = Writable;
  Writable.WritableState = WritableState;
  var { EventEmitter: EE } = __require("events");
  var Stream = require_legacy().Stream;
  var { Buffer: Buffer2 } = __require("buffer");
  var destroyImpl = require_destroy2();
  var { addAbortSignal } = require_add_abort_signal();
  var { getHighWaterMark, getDefaultHighWaterMark } = require_state();
  var {
    ERR_INVALID_ARG_TYPE,
    ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK,
    ERR_STREAM_CANNOT_PIPE,
    ERR_STREAM_DESTROYED,
    ERR_STREAM_ALREADY_FINISHED,
    ERR_STREAM_NULL_VALUES,
    ERR_STREAM_WRITE_AFTER_END,
    ERR_UNKNOWN_ENCODING
  } = require_errors().codes;
  var { errorOrDestroy } = destroyImpl;
  ObjectSetPrototypeOf(Writable.prototype, Stream.prototype);
  ObjectSetPrototypeOf(Writable, Stream);
  function nop() {}
  var kOnFinished = Symbol2("kOnFinished");
  function WritableState(options, stream, isDuplex) {
    if (typeof isDuplex !== "boolean")
      isDuplex = stream instanceof require_duplex();
    this.objectMode = !!(options && options.objectMode);
    if (isDuplex)
      this.objectMode = this.objectMode || !!(options && options.writableObjectMode);
    this.highWaterMark = options ? getHighWaterMark(this, options, "writableHighWaterMark", isDuplex) : getDefaultHighWaterMark(false);
    this.finalCalled = false;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    this.destroyed = false;
    const noDecode = !!(options && options.decodeStrings === false);
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options && options.defaultEncoding || "utf8";
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = onwrite.bind(undefined, stream);
    this.writecb = null;
    this.writelen = 0;
    this.afterWriteTickInfo = null;
    resetBuffer(this);
    this.pendingcb = 0;
    this.constructed = true;
    this.prefinished = false;
    this.errorEmitted = false;
    this.emitClose = !options || options.emitClose !== false;
    this.autoDestroy = !options || options.autoDestroy !== false;
    this.errored = null;
    this.closed = false;
    this.closeEmitted = false;
    this[kOnFinished] = [];
  }
  function resetBuffer(state) {
    state.buffered = [];
    state.bufferedIndex = 0;
    state.allBuffers = true;
    state.allNoop = true;
  }
  WritableState.prototype.getBuffer = function getBuffer() {
    return ArrayPrototypeSlice(this.buffered, this.bufferedIndex);
  };
  ObjectDefineProperty(WritableState.prototype, "bufferedRequestCount", {
    __proto__: null,
    get() {
      return this.buffered.length - this.bufferedIndex;
    }
  });
  function Writable(options) {
    const isDuplex = this instanceof require_duplex();
    if (!isDuplex && !FunctionPrototypeSymbolHasInstance(Writable, this))
      return new Writable(options);
    this._writableState = new WritableState(options, this, isDuplex);
    if (options) {
      if (typeof options.write === "function")
        this._write = options.write;
      if (typeof options.writev === "function")
        this._writev = options.writev;
      if (typeof options.destroy === "function")
        this._destroy = options.destroy;
      if (typeof options.final === "function")
        this._final = options.final;
      if (typeof options.construct === "function")
        this._construct = options.construct;
      if (options.signal)
        addAbortSignal(options.signal, this);
    }
    Stream.call(this, options);
    destroyImpl.construct(this, () => {
      const state = this._writableState;
      if (!state.writing) {
        clearBuffer(this, state);
      }
      finishMaybe(this, state);
    });
  }
  ObjectDefineProperty(Writable, SymbolHasInstance, {
    __proto__: null,
    value: function(object) {
      if (FunctionPrototypeSymbolHasInstance(this, object))
        return true;
      if (this !== Writable)
        return false;
      return object && object._writableState instanceof WritableState;
    }
  });
  Writable.prototype.pipe = function() {
    errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE);
  };
  function _write(stream, chunk, encoding, cb) {
    const state = stream._writableState;
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = state.defaultEncoding;
    } else {
      if (!encoding)
        encoding = state.defaultEncoding;
      else if (encoding !== "buffer" && !Buffer2.isEncoding(encoding))
        throw new ERR_UNKNOWN_ENCODING(encoding);
      if (typeof cb !== "function")
        cb = nop;
    }
    if (chunk === null) {
      throw new ERR_STREAM_NULL_VALUES;
    } else if (!state.objectMode) {
      if (typeof chunk === "string") {
        if (state.decodeStrings !== false) {
          chunk = Buffer2.from(chunk, encoding);
          encoding = "buffer";
        }
      } else if (chunk instanceof Buffer2) {
        encoding = "buffer";
      } else if (Stream._isUint8Array(chunk)) {
        chunk = Stream._uint8ArrayToBuffer(chunk);
        encoding = "buffer";
      } else {
        throw new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
      }
    }
    let err;
    if (state.ending) {
      err = new ERR_STREAM_WRITE_AFTER_END;
    } else if (state.destroyed) {
      err = new ERR_STREAM_DESTROYED("write");
    }
    if (err) {
      process2.nextTick(cb, err);
      errorOrDestroy(stream, err, true);
      return err;
    }
    state.pendingcb++;
    return writeOrBuffer(stream, state, chunk, encoding, cb);
  }
  Writable.prototype.write = function(chunk, encoding, cb) {
    return _write(this, chunk, encoding, cb) === true;
  };
  Writable.prototype.cork = function() {
    this._writableState.corked++;
  };
  Writable.prototype.uncork = function() {
    const state = this._writableState;
    if (state.corked) {
      state.corked--;
      if (!state.writing)
        clearBuffer(this, state);
    }
  };
  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === "string")
      encoding = StringPrototypeToLowerCase(encoding);
    if (!Buffer2.isEncoding(encoding))
      throw new ERR_UNKNOWN_ENCODING(encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
  };
  function writeOrBuffer(stream, state, chunk, encoding, callback) {
    const len = state.objectMode ? 1 : chunk.length;
    state.length += len;
    const ret = state.length < state.highWaterMark;
    if (!ret)
      state.needDrain = true;
    if (state.writing || state.corked || state.errored || !state.constructed) {
      state.buffered.push({
        chunk,
        encoding,
        callback
      });
      if (state.allBuffers && encoding !== "buffer") {
        state.allBuffers = false;
      }
      if (state.allNoop && callback !== nop) {
        state.allNoop = false;
      }
    } else {
      state.writelen = len;
      state.writecb = callback;
      state.writing = true;
      state.sync = true;
      stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    return ret && !state.errored && !state.destroyed;
  }
  function doWrite(stream, state, writev, len, chunk, encoding, cb) {
    state.writelen = len;
    state.writecb = cb;
    state.writing = true;
    state.sync = true;
    if (state.destroyed)
      state.onwrite(new ERR_STREAM_DESTROYED("write"));
    else if (writev)
      stream._writev(chunk, state.onwrite);
    else
      stream._write(chunk, encoding, state.onwrite);
    state.sync = false;
  }
  function onwriteError(stream, state, er, cb) {
    --state.pendingcb;
    cb(er);
    errorBuffer(state);
    errorOrDestroy(stream, er);
  }
  function onwrite(stream, er) {
    const state = stream._writableState;
    const sync = state.sync;
    const cb = state.writecb;
    if (typeof cb !== "function") {
      errorOrDestroy(stream, new ERR_MULTIPLE_CALLBACK);
      return;
    }
    state.writing = false;
    state.writecb = null;
    state.length -= state.writelen;
    state.writelen = 0;
    if (er) {
      er.stack;
      if (!state.errored) {
        state.errored = er;
      }
      if (stream._readableState && !stream._readableState.errored) {
        stream._readableState.errored = er;
      }
      if (sync) {
        process2.nextTick(onwriteError, stream, state, er, cb);
      } else {
        onwriteError(stream, state, er, cb);
      }
    } else {
      if (state.buffered.length > state.bufferedIndex) {
        clearBuffer(stream, state);
      }
      if (sync) {
        if (state.afterWriteTickInfo !== null && state.afterWriteTickInfo.cb === cb) {
          state.afterWriteTickInfo.count++;
        } else {
          state.afterWriteTickInfo = {
            count: 1,
            cb,
            stream,
            state
          };
          process2.nextTick(afterWriteTick, state.afterWriteTickInfo);
        }
      } else {
        afterWrite(stream, state, 1, cb);
      }
    }
  }
  function afterWriteTick({ stream, state, count, cb }) {
    state.afterWriteTickInfo = null;
    return afterWrite(stream, state, count, cb);
  }
  function afterWrite(stream, state, count, cb) {
    const needDrain = !state.ending && !stream.destroyed && state.length === 0 && state.needDrain;
    if (needDrain) {
      state.needDrain = false;
      stream.emit("drain");
    }
    while (count-- > 0) {
      state.pendingcb--;
      cb();
    }
    if (state.destroyed) {
      errorBuffer(state);
    }
    finishMaybe(stream, state);
  }
  function errorBuffer(state) {
    if (state.writing) {
      return;
    }
    for (let n = state.bufferedIndex;n < state.buffered.length; ++n) {
      var _state$errored;
      const { chunk, callback } = state.buffered[n];
      const len = state.objectMode ? 1 : chunk.length;
      state.length -= len;
      callback((_state$errored = state.errored) !== null && _state$errored !== undefined ? _state$errored : new ERR_STREAM_DESTROYED("write"));
    }
    const onfinishCallbacks = state[kOnFinished].splice(0);
    for (let i = 0;i < onfinishCallbacks.length; i++) {
      var _state$errored2;
      onfinishCallbacks[i]((_state$errored2 = state.errored) !== null && _state$errored2 !== undefined ? _state$errored2 : new ERR_STREAM_DESTROYED("end"));
    }
    resetBuffer(state);
  }
  function clearBuffer(stream, state) {
    if (state.corked || state.bufferProcessing || state.destroyed || !state.constructed) {
      return;
    }
    const { buffered, bufferedIndex, objectMode } = state;
    const bufferedLength = buffered.length - bufferedIndex;
    if (!bufferedLength) {
      return;
    }
    let i = bufferedIndex;
    state.bufferProcessing = true;
    if (bufferedLength > 1 && stream._writev) {
      state.pendingcb -= bufferedLength - 1;
      const callback = state.allNoop ? nop : (err) => {
        for (let n = i;n < buffered.length; ++n) {
          buffered[n].callback(err);
        }
      };
      const chunks = state.allNoop && i === 0 ? buffered : ArrayPrototypeSlice(buffered, i);
      chunks.allBuffers = state.allBuffers;
      doWrite(stream, state, true, state.length, chunks, "", callback);
      resetBuffer(state);
    } else {
      do {
        const { chunk, encoding, callback } = buffered[i];
        buffered[i++] = null;
        const len = objectMode ? 1 : chunk.length;
        doWrite(stream, state, false, len, chunk, encoding, callback);
      } while (i < buffered.length && !state.writing);
      if (i === buffered.length) {
        resetBuffer(state);
      } else if (i > 256) {
        buffered.splice(0, i);
        state.bufferedIndex = 0;
      } else {
        state.bufferedIndex = i;
      }
    }
    state.bufferProcessing = false;
  }
  Writable.prototype._write = function(chunk, encoding, cb) {
    if (this._writev) {
      this._writev([
        {
          chunk,
          encoding
        }
      ], cb);
    } else {
      throw new ERR_METHOD_NOT_IMPLEMENTED("_write()");
    }
  };
  Writable.prototype._writev = null;
  Writable.prototype.end = function(chunk, encoding, cb) {
    const state = this._writableState;
    if (typeof chunk === "function") {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    let err;
    if (chunk !== null && chunk !== undefined) {
      const ret = _write(this, chunk, encoding);
      if (ret instanceof Error2) {
        err = ret;
      }
    }
    if (state.corked) {
      state.corked = 1;
      this.uncork();
    }
    if (err) {} else if (!state.errored && !state.ending) {
      state.ending = true;
      finishMaybe(this, state, true);
      state.ended = true;
    } else if (state.finished) {
      err = new ERR_STREAM_ALREADY_FINISHED("end");
    } else if (state.destroyed) {
      err = new ERR_STREAM_DESTROYED("end");
    }
    if (typeof cb === "function") {
      if (err || state.finished) {
        process2.nextTick(cb, err);
      } else {
        state[kOnFinished].push(cb);
      }
    }
    return this;
  };
  function needFinish(state) {
    return state.ending && !state.destroyed && state.constructed && state.length === 0 && !state.errored && state.buffered.length === 0 && !state.finished && !state.writing && !state.errorEmitted && !state.closeEmitted;
  }
  function callFinal(stream, state) {
    let called = false;
    function onFinish(err) {
      if (called) {
        errorOrDestroy(stream, err !== null && err !== undefined ? err : ERR_MULTIPLE_CALLBACK());
        return;
      }
      called = true;
      state.pendingcb--;
      if (err) {
        const onfinishCallbacks = state[kOnFinished].splice(0);
        for (let i = 0;i < onfinishCallbacks.length; i++) {
          onfinishCallbacks[i](err);
        }
        errorOrDestroy(stream, err, state.sync);
      } else if (needFinish(state)) {
        state.prefinished = true;
        stream.emit("prefinish");
        state.pendingcb++;
        process2.nextTick(finish, stream, state);
      }
    }
    state.sync = true;
    state.pendingcb++;
    try {
      stream._final(onFinish);
    } catch (err) {
      onFinish(err);
    }
    state.sync = false;
  }
  function prefinish(stream, state) {
    if (!state.prefinished && !state.finalCalled) {
      if (typeof stream._final === "function" && !state.destroyed) {
        state.finalCalled = true;
        callFinal(stream, state);
      } else {
        state.prefinished = true;
        stream.emit("prefinish");
      }
    }
  }
  function finishMaybe(stream, state, sync) {
    if (needFinish(state)) {
      prefinish(stream, state);
      if (state.pendingcb === 0) {
        if (sync) {
          state.pendingcb++;
          process2.nextTick((stream2, state2) => {
            if (needFinish(state2)) {
              finish(stream2, state2);
            } else {
              state2.pendingcb--;
            }
          }, stream, state);
        } else if (needFinish(state)) {
          state.pendingcb++;
          finish(stream, state);
        }
      }
    }
  }
  function finish(stream, state) {
    state.pendingcb--;
    state.finished = true;
    const onfinishCallbacks = state[kOnFinished].splice(0);
    for (let i = 0;i < onfinishCallbacks.length; i++) {
      onfinishCallbacks[i]();
    }
    stream.emit("finish");
    if (state.autoDestroy) {
      const rState = stream._readableState;
      const autoDestroy = !rState || rState.autoDestroy && (rState.endEmitted || rState.readable === false);
      if (autoDestroy) {
        stream.destroy();
      }
    }
  }
  ObjectDefineProperties(Writable.prototype, {
    closed: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.closed : false;
      }
    },
    destroyed: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.destroyed : false;
      },
      set(value) {
        if (this._writableState) {
          this._writableState.destroyed = value;
        }
      }
    },
    writable: {
      __proto__: null,
      get() {
        const w = this._writableState;
        return !!w && w.writable !== false && !w.destroyed && !w.errored && !w.ending && !w.ended;
      },
      set(val) {
        if (this._writableState) {
          this._writableState.writable = !!val;
        }
      }
    },
    writableFinished: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.finished : false;
      }
    },
    writableObjectMode: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.objectMode : false;
      }
    },
    writableBuffer: {
      __proto__: null,
      get() {
        return this._writableState && this._writableState.getBuffer();
      }
    },
    writableEnded: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.ending : false;
      }
    },
    writableNeedDrain: {
      __proto__: null,
      get() {
        const wState = this._writableState;
        if (!wState)
          return false;
        return !wState.destroyed && !wState.ending && wState.needDrain;
      }
    },
    writableHighWaterMark: {
      __proto__: null,
      get() {
        return this._writableState && this._writableState.highWaterMark;
      }
    },
    writableCorked: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.corked : 0;
      }
    },
    writableLength: {
      __proto__: null,
      get() {
        return this._writableState && this._writableState.length;
      }
    },
    errored: {
      __proto__: null,
      enumerable: false,
      get() {
        return this._writableState ? this._writableState.errored : null;
      }
    },
    writableAborted: {
      __proto__: null,
      enumerable: false,
      get: function() {
        return !!(this._writableState.writable !== false && (this._writableState.destroyed || this._writableState.errored) && !this._writableState.finished);
      }
    }
  });
  var destroy = destroyImpl.destroy;
  Writable.prototype.destroy = function(err, cb) {
    const state = this._writableState;
    if (!state.destroyed && (state.bufferedIndex < state.buffered.length || state[kOnFinished].length)) {
      process2.nextTick(errorBuffer, state);
    }
    destroy.call(this, err, cb);
    return this;
  };
  Writable.prototype._undestroy = destroyImpl.undestroy;
  Writable.prototype._destroy = function(err, cb) {
    cb(err);
  };
  Writable.prototype[EE.captureRejectionSymbol] = function(err) {
    this.destroy(err);
  };
  var webStreamsAdapters;
  function lazyWebStreams() {
    if (webStreamsAdapters === undefined)
      webStreamsAdapters = {};
    return webStreamsAdapters;
  }
  Writable.fromWeb = function(writableStream, options) {
    return lazyWebStreams().newStreamWritableFromWritableStream(writableStream, options);
  };
  Writable.toWeb = function(streamWritable) {
    return lazyWebStreams().newWritableStreamFromStreamWritable(streamWritable);
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/duplexify.js
var require_duplexify = __commonJS((exports, module) => {
  var process2 = require_process();
  var bufferModule = __require("buffer");
  var {
    isReadable,
    isWritable,
    isIterable,
    isNodeStream,
    isReadableNodeStream,
    isWritableNodeStream,
    isDuplexNodeStream,
    isReadableStream,
    isWritableStream
  } = require_utils();
  var eos = require_end_of_stream();
  var {
    AbortError,
    codes: { ERR_INVALID_ARG_TYPE, ERR_INVALID_RETURN_VALUE }
  } = require_errors();
  var { destroyer } = require_destroy2();
  var Duplex = require_duplex();
  var Readable = require_readable2();
  var Writable = require_writable();
  var { createDeferredPromise } = require_util2();
  var from = require_from();
  var Blob = globalThis.Blob || bufferModule.Blob;
  var isBlob = typeof Blob !== "undefined" ? function isBlob(b) {
    return b instanceof Blob;
  } : function isBlob(b) {
    return false;
  };
  var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
  var { FunctionPrototypeCall } = require_primordials();

  class Duplexify extends Duplex {
    constructor(options) {
      super(options);
      if ((options === null || options === undefined ? undefined : options.readable) === false) {
        this._readableState.readable = false;
        this._readableState.ended = true;
        this._readableState.endEmitted = true;
      }
      if ((options === null || options === undefined ? undefined : options.writable) === false) {
        this._writableState.writable = false;
        this._writableState.ending = true;
        this._writableState.ended = true;
        this._writableState.finished = true;
      }
    }
  }
  module.exports = function duplexify(body, name) {
    if (isDuplexNodeStream(body)) {
      return body;
    }
    if (isReadableNodeStream(body)) {
      return _duplexify({
        readable: body
      });
    }
    if (isWritableNodeStream(body)) {
      return _duplexify({
        writable: body
      });
    }
    if (isNodeStream(body)) {
      return _duplexify({
        writable: false,
        readable: false
      });
    }
    if (isReadableStream(body)) {
      return _duplexify({
        readable: Readable.fromWeb(body)
      });
    }
    if (isWritableStream(body)) {
      return _duplexify({
        writable: Writable.fromWeb(body)
      });
    }
    if (typeof body === "function") {
      const { value, write, final, destroy } = fromAsyncGen(body);
      if (isIterable(value)) {
        return from(Duplexify, value, {
          objectMode: true,
          write,
          final,
          destroy
        });
      }
      const then2 = value === null || value === undefined ? undefined : value.then;
      if (typeof then2 === "function") {
        let d;
        const promise = FunctionPrototypeCall(then2, value, (val) => {
          if (val != null) {
            throw new ERR_INVALID_RETURN_VALUE("nully", "body", val);
          }
        }, (err) => {
          destroyer(d, err);
        });
        return d = new Duplexify({
          objectMode: true,
          readable: false,
          write,
          final(cb) {
            final(async () => {
              try {
                await promise;
                process2.nextTick(cb, null);
              } catch (err) {
                process2.nextTick(cb, err);
              }
            });
          },
          destroy
        });
      }
      throw new ERR_INVALID_RETURN_VALUE("Iterable, AsyncIterable or AsyncFunction", name, value);
    }
    if (isBlob(body)) {
      return duplexify(body.arrayBuffer());
    }
    if (isIterable(body)) {
      return from(Duplexify, body, {
        objectMode: true,
        writable: false
      });
    }
    if (isReadableStream(body === null || body === undefined ? undefined : body.readable) && isWritableStream(body === null || body === undefined ? undefined : body.writable)) {
      return Duplexify.fromWeb(body);
    }
    if (typeof (body === null || body === undefined ? undefined : body.writable) === "object" || typeof (body === null || body === undefined ? undefined : body.readable) === "object") {
      const readable = body !== null && body !== undefined && body.readable ? isReadableNodeStream(body === null || body === undefined ? undefined : body.readable) ? body === null || body === undefined ? undefined : body.readable : duplexify(body.readable) : undefined;
      const writable = body !== null && body !== undefined && body.writable ? isWritableNodeStream(body === null || body === undefined ? undefined : body.writable) ? body === null || body === undefined ? undefined : body.writable : duplexify(body.writable) : undefined;
      return _duplexify({
        readable,
        writable
      });
    }
    const then = body === null || body === undefined ? undefined : body.then;
    if (typeof then === "function") {
      let d;
      FunctionPrototypeCall(then, body, (val) => {
        if (val != null) {
          d.push(val);
        }
        d.push(null);
      }, (err) => {
        destroyer(d, err);
      });
      return d = new Duplexify({
        objectMode: true,
        writable: false,
        read() {}
      });
    }
    throw new ERR_INVALID_ARG_TYPE(name, [
      "Blob",
      "ReadableStream",
      "WritableStream",
      "Stream",
      "Iterable",
      "AsyncIterable",
      "Function",
      "{ readable, writable } pair",
      "Promise"
    ], body);
  };
  function fromAsyncGen(fn) {
    let { promise, resolve } = createDeferredPromise();
    const ac = new AbortController;
    const signal = ac.signal;
    const value = fn(async function* () {
      while (true) {
        const _promise = promise;
        promise = null;
        const { chunk, done, cb } = await _promise;
        process2.nextTick(cb);
        if (done)
          return;
        if (signal.aborted)
          throw new AbortError(undefined, {
            cause: signal.reason
          });
        ({ promise, resolve } = createDeferredPromise());
        yield chunk;
      }
    }(), {
      signal
    });
    return {
      value,
      write(chunk, encoding, cb) {
        const _resolve = resolve;
        resolve = null;
        _resolve({
          chunk,
          done: false,
          cb
        });
      },
      final(cb) {
        const _resolve = resolve;
        resolve = null;
        _resolve({
          done: true,
          cb
        });
      },
      destroy(err, cb) {
        ac.abort();
        cb(err);
      }
    };
  }
  function _duplexify(pair) {
    const r = pair.readable && typeof pair.readable.read !== "function" ? Readable.wrap(pair.readable) : pair.readable;
    const w = pair.writable;
    let readable = !!isReadable(r);
    let writable = !!isWritable(w);
    let ondrain;
    let onfinish;
    let onreadable;
    let onclose;
    let d;
    function onfinished(err) {
      const cb = onclose;
      onclose = null;
      if (cb) {
        cb(err);
      } else if (err) {
        d.destroy(err);
      }
    }
    d = new Duplexify({
      readableObjectMode: !!(r !== null && r !== undefined && r.readableObjectMode),
      writableObjectMode: !!(w !== null && w !== undefined && w.writableObjectMode),
      readable,
      writable
    });
    if (writable) {
      eos(w, (err) => {
        writable = false;
        if (err) {
          destroyer(r, err);
        }
        onfinished(err);
      });
      d._write = function(chunk, encoding, callback) {
        if (w.write(chunk, encoding)) {
          callback();
        } else {
          ondrain = callback;
        }
      };
      d._final = function(callback) {
        w.end();
        onfinish = callback;
      };
      w.on("drain", function() {
        if (ondrain) {
          const cb = ondrain;
          ondrain = null;
          cb();
        }
      });
      w.on("finish", function() {
        if (onfinish) {
          const cb = onfinish;
          onfinish = null;
          cb();
        }
      });
    }
    if (readable) {
      eos(r, (err) => {
        readable = false;
        if (err) {
          destroyer(r, err);
        }
        onfinished(err);
      });
      r.on("readable", function() {
        if (onreadable) {
          const cb = onreadable;
          onreadable = null;
          cb();
        }
      });
      r.on("end", function() {
        d.push(null);
      });
      d._read = function() {
        while (true) {
          const buf = r.read();
          if (buf === null) {
            onreadable = d._read;
            return;
          }
          if (!d.push(buf)) {
            return;
          }
        }
      };
    }
    d._destroy = function(err, callback) {
      if (!err && onclose !== null) {
        err = new AbortError;
      }
      onreadable = null;
      ondrain = null;
      onfinish = null;
      if (onclose === null) {
        callback(err);
      } else {
        onclose = callback;
        destroyer(w, err);
        destroyer(r, err);
      }
    };
    return d;
  }
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/duplex.js
var require_duplex = __commonJS((exports, module) => {
  var {
    ObjectDefineProperties,
    ObjectGetOwnPropertyDescriptor,
    ObjectKeys,
    ObjectSetPrototypeOf
  } = require_primordials();
  module.exports = Duplex;
  var Readable = require_readable2();
  var Writable = require_writable();
  ObjectSetPrototypeOf(Duplex.prototype, Readable.prototype);
  ObjectSetPrototypeOf(Duplex, Readable);
  {
    const keys = ObjectKeys(Writable.prototype);
    for (let i = 0;i < keys.length; i++) {
      const method = keys[i];
      if (!Duplex.prototype[method])
        Duplex.prototype[method] = Writable.prototype[method];
    }
  }
  function Duplex(options) {
    if (!(this instanceof Duplex))
      return new Duplex(options);
    Readable.call(this, options);
    Writable.call(this, options);
    if (options) {
      this.allowHalfOpen = options.allowHalfOpen !== false;
      if (options.readable === false) {
        this._readableState.readable = false;
        this._readableState.ended = true;
        this._readableState.endEmitted = true;
      }
      if (options.writable === false) {
        this._writableState.writable = false;
        this._writableState.ending = true;
        this._writableState.ended = true;
        this._writableState.finished = true;
      }
    } else {
      this.allowHalfOpen = true;
    }
  }
  ObjectDefineProperties(Duplex.prototype, {
    writable: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writable")
    },
    writableHighWaterMark: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableHighWaterMark")
    },
    writableObjectMode: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableObjectMode")
    },
    writableBuffer: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableBuffer")
    },
    writableLength: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableLength")
    },
    writableFinished: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableFinished")
    },
    writableCorked: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableCorked")
    },
    writableEnded: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableEnded")
    },
    writableNeedDrain: {
      __proto__: null,
      ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableNeedDrain")
    },
    destroyed: {
      __proto__: null,
      get() {
        if (this._readableState === undefined || this._writableState === undefined) {
          return false;
        }
        return this._readableState.destroyed && this._writableState.destroyed;
      },
      set(value) {
        if (this._readableState && this._writableState) {
          this._readableState.destroyed = value;
          this._writableState.destroyed = value;
        }
      }
    }
  });
  var webStreamsAdapters;
  function lazyWebStreams() {
    if (webStreamsAdapters === undefined)
      webStreamsAdapters = {};
    return webStreamsAdapters;
  }
  Duplex.fromWeb = function(pair, options) {
    return lazyWebStreams().newStreamDuplexFromReadableWritablePair(pair, options);
  };
  Duplex.toWeb = function(duplex) {
    return lazyWebStreams().newReadableWritablePairFromDuplex(duplex);
  };
  var duplexify;
  Duplex.from = function(body) {
    if (!duplexify) {
      duplexify = require_duplexify();
    }
    return duplexify(body, "body");
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/transform.js
var require_transform = __commonJS((exports, module) => {
  var { ObjectSetPrototypeOf, Symbol: Symbol2 } = require_primordials();
  module.exports = Transform;
  var { ERR_METHOD_NOT_IMPLEMENTED } = require_errors().codes;
  var Duplex = require_duplex();
  var { getHighWaterMark } = require_state();
  ObjectSetPrototypeOf(Transform.prototype, Duplex.prototype);
  ObjectSetPrototypeOf(Transform, Duplex);
  var kCallback = Symbol2("kCallback");
  function Transform(options) {
    if (!(this instanceof Transform))
      return new Transform(options);
    const readableHighWaterMark = options ? getHighWaterMark(this, options, "readableHighWaterMark", true) : null;
    if (readableHighWaterMark === 0) {
      options = {
        ...options,
        highWaterMark: null,
        readableHighWaterMark,
        writableHighWaterMark: options.writableHighWaterMark || 0
      };
    }
    Duplex.call(this, options);
    this._readableState.sync = false;
    this[kCallback] = null;
    if (options) {
      if (typeof options.transform === "function")
        this._transform = options.transform;
      if (typeof options.flush === "function")
        this._flush = options.flush;
    }
    this.on("prefinish", prefinish);
  }
  function final(cb) {
    if (typeof this._flush === "function" && !this.destroyed) {
      this._flush((er, data) => {
        if (er) {
          if (cb) {
            cb(er);
          } else {
            this.destroy(er);
          }
          return;
        }
        if (data != null) {
          this.push(data);
        }
        this.push(null);
        if (cb) {
          cb();
        }
      });
    } else {
      this.push(null);
      if (cb) {
        cb();
      }
    }
  }
  function prefinish() {
    if (this._final !== final) {
      final.call(this);
    }
  }
  Transform.prototype._final = final;
  Transform.prototype._transform = function(chunk, encoding, callback) {
    throw new ERR_METHOD_NOT_IMPLEMENTED("_transform()");
  };
  Transform.prototype._write = function(chunk, encoding, callback) {
    const rState = this._readableState;
    const wState = this._writableState;
    const length = rState.length;
    this._transform(chunk, encoding, (err, val) => {
      if (err) {
        callback(err);
        return;
      }
      if (val != null) {
        this.push(val);
      }
      if (wState.ended || length === rState.length || rState.length < rState.highWaterMark) {
        callback();
      } else {
        this[kCallback] = callback;
      }
    });
  };
  Transform.prototype._read = function() {
    if (this[kCallback]) {
      const callback = this[kCallback];
      this[kCallback] = null;
      callback();
    }
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/passthrough.js
var require_passthrough2 = __commonJS((exports, module) => {
  var { ObjectSetPrototypeOf } = require_primordials();
  module.exports = PassThrough;
  var Transform = require_transform();
  ObjectSetPrototypeOf(PassThrough.prototype, Transform.prototype);
  ObjectSetPrototypeOf(PassThrough, Transform);
  function PassThrough(options) {
    if (!(this instanceof PassThrough))
      return new PassThrough(options);
    Transform.call(this, options);
  }
  PassThrough.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/pipeline.js
var require_pipeline = __commonJS((exports, module) => {
  var process2 = require_process();
  var { ArrayIsArray, Promise: Promise2, SymbolAsyncIterator, SymbolDispose } = require_primordials();
  var eos = require_end_of_stream();
  var { once } = require_util2();
  var destroyImpl = require_destroy2();
  var Duplex = require_duplex();
  var {
    aggregateTwoErrors,
    codes: {
      ERR_INVALID_ARG_TYPE,
      ERR_INVALID_RETURN_VALUE,
      ERR_MISSING_ARGS,
      ERR_STREAM_DESTROYED,
      ERR_STREAM_PREMATURE_CLOSE
    },
    AbortError
  } = require_errors();
  var { validateFunction, validateAbortSignal } = require_validators();
  var {
    isIterable,
    isReadable,
    isReadableNodeStream,
    isNodeStream,
    isTransformStream,
    isWebStream,
    isReadableStream,
    isReadableFinished
  } = require_utils();
  var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
  var PassThrough;
  var Readable;
  var addAbortListener;
  function destroyer(stream, reading, writing) {
    let finished = false;
    stream.on("close", () => {
      finished = true;
    });
    const cleanup = eos(stream, {
      readable: reading,
      writable: writing
    }, (err) => {
      finished = !err;
    });
    return {
      destroy: (err) => {
        if (finished)
          return;
        finished = true;
        destroyImpl.destroyer(stream, err || new ERR_STREAM_DESTROYED("pipe"));
      },
      cleanup
    };
  }
  function popCallback(streams) {
    validateFunction(streams[streams.length - 1], "streams[stream.length - 1]");
    return streams.pop();
  }
  function makeAsyncIterable(val) {
    if (isIterable(val)) {
      return val;
    } else if (isReadableNodeStream(val)) {
      return fromReadable(val);
    }
    throw new ERR_INVALID_ARG_TYPE("val", ["Readable", "Iterable", "AsyncIterable"], val);
  }
  async function* fromReadable(val) {
    if (!Readable) {
      Readable = require_readable2();
    }
    yield* Readable.prototype[SymbolAsyncIterator].call(val);
  }
  async function pumpToNode(iterable, writable, finish, { end }) {
    let error;
    let onresolve = null;
    const resume = (err) => {
      if (err) {
        error = err;
      }
      if (onresolve) {
        const callback = onresolve;
        onresolve = null;
        callback();
      }
    };
    const wait = () => new Promise2((resolve, reject) => {
      if (error) {
        reject(error);
      } else {
        onresolve = () => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        };
      }
    });
    writable.on("drain", resume);
    const cleanup = eos(writable, {
      readable: false
    }, resume);
    try {
      if (writable.writableNeedDrain) {
        await wait();
      }
      for await (const chunk of iterable) {
        if (!writable.write(chunk)) {
          await wait();
        }
      }
      if (end) {
        writable.end();
        await wait();
      }
      finish();
    } catch (err) {
      finish(error !== err ? aggregateTwoErrors(error, err) : err);
    } finally {
      cleanup();
      writable.off("drain", resume);
    }
  }
  async function pumpToWeb(readable, writable, finish, { end }) {
    if (isTransformStream(writable)) {
      writable = writable.writable;
    }
    const writer = writable.getWriter();
    try {
      for await (const chunk of readable) {
        await writer.ready;
        writer.write(chunk).catch(() => {});
      }
      await writer.ready;
      if (end) {
        await writer.close();
      }
      finish();
    } catch (err) {
      try {
        await writer.abort(err);
        finish(err);
      } catch (err2) {
        finish(err2);
      }
    }
  }
  function pipeline(...streams) {
    return pipelineImpl(streams, once(popCallback(streams)));
  }
  function pipelineImpl(streams, callback, opts) {
    if (streams.length === 1 && ArrayIsArray(streams[0])) {
      streams = streams[0];
    }
    if (streams.length < 2) {
      throw new ERR_MISSING_ARGS("streams");
    }
    const ac = new AbortController;
    const signal = ac.signal;
    const outerSignal = opts === null || opts === undefined ? undefined : opts.signal;
    const lastStreamCleanup = [];
    validateAbortSignal(outerSignal, "options.signal");
    function abort() {
      finishImpl(new AbortError);
    }
    addAbortListener = addAbortListener || require_util2().addAbortListener;
    let disposable;
    if (outerSignal) {
      disposable = addAbortListener(outerSignal, abort);
    }
    let error;
    let value;
    const destroys = [];
    let finishCount = 0;
    function finish(err) {
      finishImpl(err, --finishCount === 0);
    }
    function finishImpl(err, final) {
      var _disposable;
      if (err && (!error || error.code === "ERR_STREAM_PREMATURE_CLOSE")) {
        error = err;
      }
      if (!error && !final) {
        return;
      }
      while (destroys.length) {
        destroys.shift()(error);
      }
      (_disposable = disposable) === null || _disposable === undefined || _disposable[SymbolDispose]();
      ac.abort();
      if (final) {
        if (!error) {
          lastStreamCleanup.forEach((fn) => fn());
        }
        process2.nextTick(callback, error, value);
      }
    }
    let ret;
    for (let i = 0;i < streams.length; i++) {
      const stream = streams[i];
      const reading = i < streams.length - 1;
      const writing = i > 0;
      const end = reading || (opts === null || opts === undefined ? undefined : opts.end) !== false;
      const isLastStream = i === streams.length - 1;
      if (isNodeStream(stream)) {
        let onError2 = function(err) {
          if (err && err.name !== "AbortError" && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
            finish(err);
          }
        };
        var onError = onError2;
        if (end) {
          const { destroy, cleanup } = destroyer(stream, reading, writing);
          destroys.push(destroy);
          if (isReadable(stream) && isLastStream) {
            lastStreamCleanup.push(cleanup);
          }
        }
        stream.on("error", onError2);
        if (isReadable(stream) && isLastStream) {
          lastStreamCleanup.push(() => {
            stream.removeListener("error", onError2);
          });
        }
      }
      if (i === 0) {
        if (typeof stream === "function") {
          ret = stream({
            signal
          });
          if (!isIterable(ret)) {
            throw new ERR_INVALID_RETURN_VALUE("Iterable, AsyncIterable or Stream", "source", ret);
          }
        } else if (isIterable(stream) || isReadableNodeStream(stream) || isTransformStream(stream)) {
          ret = stream;
        } else {
          ret = Duplex.from(stream);
        }
      } else if (typeof stream === "function") {
        if (isTransformStream(ret)) {
          var _ret;
          ret = makeAsyncIterable((_ret = ret) === null || _ret === undefined ? undefined : _ret.readable);
        } else {
          ret = makeAsyncIterable(ret);
        }
        ret = stream(ret, {
          signal
        });
        if (reading) {
          if (!isIterable(ret, true)) {
            throw new ERR_INVALID_RETURN_VALUE("AsyncIterable", `transform[${i - 1}]`, ret);
          }
        } else {
          var _ret2;
          if (!PassThrough) {
            PassThrough = require_passthrough2();
          }
          const pt = new PassThrough({
            objectMode: true
          });
          const then = (_ret2 = ret) === null || _ret2 === undefined ? undefined : _ret2.then;
          if (typeof then === "function") {
            finishCount++;
            then.call(ret, (val) => {
              value = val;
              if (val != null) {
                pt.write(val);
              }
              if (end) {
                pt.end();
              }
              process2.nextTick(finish);
            }, (err) => {
              pt.destroy(err);
              process2.nextTick(finish, err);
            });
          } else if (isIterable(ret, true)) {
            finishCount++;
            pumpToNode(ret, pt, finish, {
              end
            });
          } else if (isReadableStream(ret) || isTransformStream(ret)) {
            const toRead = ret.readable || ret;
            finishCount++;
            pumpToNode(toRead, pt, finish, {
              end
            });
          } else {
            throw new ERR_INVALID_RETURN_VALUE("AsyncIterable or Promise", "destination", ret);
          }
          ret = pt;
          const { destroy, cleanup } = destroyer(ret, false, true);
          destroys.push(destroy);
          if (isLastStream) {
            lastStreamCleanup.push(cleanup);
          }
        }
      } else if (isNodeStream(stream)) {
        if (isReadableNodeStream(ret)) {
          finishCount += 2;
          const cleanup = pipe(ret, stream, finish, {
            end
          });
          if (isReadable(stream) && isLastStream) {
            lastStreamCleanup.push(cleanup);
          }
        } else if (isTransformStream(ret) || isReadableStream(ret)) {
          const toRead = ret.readable || ret;
          finishCount++;
          pumpToNode(toRead, stream, finish, {
            end
          });
        } else if (isIterable(ret)) {
          finishCount++;
          pumpToNode(ret, stream, finish, {
            end
          });
        } else {
          throw new ERR_INVALID_ARG_TYPE("val", ["Readable", "Iterable", "AsyncIterable", "ReadableStream", "TransformStream"], ret);
        }
        ret = stream;
      } else if (isWebStream(stream)) {
        if (isReadableNodeStream(ret)) {
          finishCount++;
          pumpToWeb(makeAsyncIterable(ret), stream, finish, {
            end
          });
        } else if (isReadableStream(ret) || isIterable(ret)) {
          finishCount++;
          pumpToWeb(ret, stream, finish, {
            end
          });
        } else if (isTransformStream(ret)) {
          finishCount++;
          pumpToWeb(ret.readable, stream, finish, {
            end
          });
        } else {
          throw new ERR_INVALID_ARG_TYPE("val", ["Readable", "Iterable", "AsyncIterable", "ReadableStream", "TransformStream"], ret);
        }
        ret = stream;
      } else {
        ret = Duplex.from(stream);
      }
    }
    if (signal !== null && signal !== undefined && signal.aborted || outerSignal !== null && outerSignal !== undefined && outerSignal.aborted) {
      process2.nextTick(abort);
    }
    return ret;
  }
  function pipe(src, dst, finish, { end }) {
    let ended = false;
    dst.on("close", () => {
      if (!ended) {
        finish(new ERR_STREAM_PREMATURE_CLOSE);
      }
    });
    src.pipe(dst, {
      end: false
    });
    if (end) {
      let endFn2 = function() {
        ended = true;
        dst.end();
      };
      var endFn = endFn2;
      if (isReadableFinished(src)) {
        process2.nextTick(endFn2);
      } else {
        src.once("end", endFn2);
      }
    } else {
      finish();
    }
    eos(src, {
      readable: true,
      writable: false
    }, (err) => {
      const rState = src._readableState;
      if (err && err.code === "ERR_STREAM_PREMATURE_CLOSE" && rState && rState.ended && !rState.errored && !rState.errorEmitted) {
        src.once("end", finish).once("error", finish);
      } else {
        finish(err);
      }
    });
    return eos(dst, {
      readable: false,
      writable: true
    }, finish);
  }
  module.exports = {
    pipelineImpl,
    pipeline
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/compose.js
var require_compose = __commonJS((exports, module) => {
  var { pipeline } = require_pipeline();
  var Duplex = require_duplex();
  var { destroyer } = require_destroy2();
  var {
    isNodeStream,
    isReadable,
    isWritable,
    isWebStream,
    isTransformStream,
    isWritableStream,
    isReadableStream
  } = require_utils();
  var {
    AbortError,
    codes: { ERR_INVALID_ARG_VALUE, ERR_MISSING_ARGS }
  } = require_errors();
  var eos = require_end_of_stream();
  module.exports = function compose(...streams) {
    if (streams.length === 0) {
      throw new ERR_MISSING_ARGS("streams");
    }
    if (streams.length === 1) {
      return Duplex.from(streams[0]);
    }
    const orgStreams = [...streams];
    if (typeof streams[0] === "function") {
      streams[0] = Duplex.from(streams[0]);
    }
    if (typeof streams[streams.length - 1] === "function") {
      const idx = streams.length - 1;
      streams[idx] = Duplex.from(streams[idx]);
    }
    for (let n = 0;n < streams.length; ++n) {
      if (!isNodeStream(streams[n]) && !isWebStream(streams[n])) {
        continue;
      }
      if (n < streams.length - 1 && !(isReadable(streams[n]) || isReadableStream(streams[n]) || isTransformStream(streams[n]))) {
        throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], "must be readable");
      }
      if (n > 0 && !(isWritable(streams[n]) || isWritableStream(streams[n]) || isTransformStream(streams[n]))) {
        throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], "must be writable");
      }
    }
    let ondrain;
    let onfinish;
    let onreadable;
    let onclose;
    let d;
    function onfinished(err) {
      const cb = onclose;
      onclose = null;
      if (cb) {
        cb(err);
      } else if (err) {
        d.destroy(err);
      } else if (!readable && !writable) {
        d.destroy();
      }
    }
    const head = streams[0];
    const tail = pipeline(streams, onfinished);
    const writable = !!(isWritable(head) || isWritableStream(head) || isTransformStream(head));
    const readable = !!(isReadable(tail) || isReadableStream(tail) || isTransformStream(tail));
    d = new Duplex({
      writableObjectMode: !!(head !== null && head !== undefined && head.writableObjectMode),
      readableObjectMode: !!(tail !== null && tail !== undefined && tail.readableObjectMode),
      writable,
      readable
    });
    if (writable) {
      if (isNodeStream(head)) {
        d._write = function(chunk, encoding, callback) {
          if (head.write(chunk, encoding)) {
            callback();
          } else {
            ondrain = callback;
          }
        };
        d._final = function(callback) {
          head.end();
          onfinish = callback;
        };
        head.on("drain", function() {
          if (ondrain) {
            const cb = ondrain;
            ondrain = null;
            cb();
          }
        });
      } else if (isWebStream(head)) {
        const writable2 = isTransformStream(head) ? head.writable : head;
        const writer = writable2.getWriter();
        d._write = async function(chunk, encoding, callback) {
          try {
            await writer.ready;
            writer.write(chunk).catch(() => {});
            callback();
          } catch (err) {
            callback(err);
          }
        };
        d._final = async function(callback) {
          try {
            await writer.ready;
            writer.close().catch(() => {});
            onfinish = callback;
          } catch (err) {
            callback(err);
          }
        };
      }
      const toRead = isTransformStream(tail) ? tail.readable : tail;
      eos(toRead, () => {
        if (onfinish) {
          const cb = onfinish;
          onfinish = null;
          cb();
        }
      });
    }
    if (readable) {
      if (isNodeStream(tail)) {
        tail.on("readable", function() {
          if (onreadable) {
            const cb = onreadable;
            onreadable = null;
            cb();
          }
        });
        tail.on("end", function() {
          d.push(null);
        });
        d._read = function() {
          while (true) {
            const buf = tail.read();
            if (buf === null) {
              onreadable = d._read;
              return;
            }
            if (!d.push(buf)) {
              return;
            }
          }
        };
      } else if (isWebStream(tail)) {
        const readable2 = isTransformStream(tail) ? tail.readable : tail;
        const reader = readable2.getReader();
        d._read = async function() {
          while (true) {
            try {
              const { value, done } = await reader.read();
              if (!d.push(value)) {
                return;
              }
              if (done) {
                d.push(null);
                return;
              }
            } catch {
              return;
            }
          }
        };
      }
    }
    d._destroy = function(err, callback) {
      if (!err && onclose !== null) {
        err = new AbortError;
      }
      onreadable = null;
      ondrain = null;
      onfinish = null;
      if (onclose === null) {
        callback(err);
      } else {
        onclose = callback;
        if (isNodeStream(tail)) {
          destroyer(tail, err);
        }
      }
    };
    return d;
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/internal/streams/operators.js
var require_operators = __commonJS((exports, module) => {
  var AbortController = globalThis.AbortController || require_abort_controller().AbortController;
  var {
    codes: { ERR_INVALID_ARG_VALUE, ERR_INVALID_ARG_TYPE, ERR_MISSING_ARGS, ERR_OUT_OF_RANGE },
    AbortError
  } = require_errors();
  var { validateAbortSignal, validateInteger, validateObject } = require_validators();
  var kWeakHandler = require_primordials().Symbol("kWeak");
  var kResistStopPropagation = require_primordials().Symbol("kResistStopPropagation");
  var { finished } = require_end_of_stream();
  var staticCompose = require_compose();
  var { addAbortSignalNoValidate } = require_add_abort_signal();
  var { isWritable, isNodeStream } = require_utils();
  var { deprecate } = require_util2();
  var {
    ArrayPrototypePush,
    Boolean: Boolean2,
    MathFloor,
    Number: Number2,
    NumberIsNaN,
    Promise: Promise2,
    PromiseReject,
    PromiseResolve,
    PromisePrototypeThen,
    Symbol: Symbol2
  } = require_primordials();
  var kEmpty = Symbol2("kEmpty");
  var kEof = Symbol2("kEof");
  function compose(stream, options) {
    if (options != null) {
      validateObject(options, "options");
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, "options.signal");
    }
    if (isNodeStream(stream) && !isWritable(stream)) {
      throw new ERR_INVALID_ARG_VALUE("stream", stream, "must be writable");
    }
    const composedStream = staticCompose(this, stream);
    if (options !== null && options !== undefined && options.signal) {
      addAbortSignalNoValidate(options.signal, composedStream);
    }
    return composedStream;
  }
  function map(fn, options) {
    if (typeof fn !== "function") {
      throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
    }
    if (options != null) {
      validateObject(options, "options");
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, "options.signal");
    }
    let concurrency = 1;
    if ((options === null || options === undefined ? undefined : options.concurrency) != null) {
      concurrency = MathFloor(options.concurrency);
    }
    let highWaterMark = concurrency - 1;
    if ((options === null || options === undefined ? undefined : options.highWaterMark) != null) {
      highWaterMark = MathFloor(options.highWaterMark);
    }
    validateInteger(concurrency, "options.concurrency", 1);
    validateInteger(highWaterMark, "options.highWaterMark", 0);
    highWaterMark += concurrency;
    return async function* map() {
      const signal = require_util2().AbortSignalAny([options === null || options === undefined ? undefined : options.signal].filter(Boolean2));
      const stream = this;
      const queue = [];
      const signalOpt = {
        signal
      };
      let next;
      let resume;
      let done = false;
      let cnt = 0;
      function onCatch() {
        done = true;
        afterItemProcessed();
      }
      function afterItemProcessed() {
        cnt -= 1;
        maybeResume();
      }
      function maybeResume() {
        if (resume && !done && cnt < concurrency && queue.length < highWaterMark) {
          resume();
          resume = null;
        }
      }
      async function pump() {
        try {
          for await (let val of stream) {
            if (done) {
              return;
            }
            if (signal.aborted) {
              throw new AbortError;
            }
            try {
              val = fn(val, signalOpt);
              if (val === kEmpty) {
                continue;
              }
              val = PromiseResolve(val);
            } catch (err) {
              val = PromiseReject(err);
            }
            cnt += 1;
            PromisePrototypeThen(val, afterItemProcessed, onCatch);
            queue.push(val);
            if (next) {
              next();
              next = null;
            }
            if (!done && (queue.length >= highWaterMark || cnt >= concurrency)) {
              await new Promise2((resolve) => {
                resume = resolve;
              });
            }
          }
          queue.push(kEof);
        } catch (err) {
          const val = PromiseReject(err);
          PromisePrototypeThen(val, afterItemProcessed, onCatch);
          queue.push(val);
        } finally {
          done = true;
          if (next) {
            next();
            next = null;
          }
        }
      }
      pump();
      try {
        while (true) {
          while (queue.length > 0) {
            const val = await queue[0];
            if (val === kEof) {
              return;
            }
            if (signal.aborted) {
              throw new AbortError;
            }
            if (val !== kEmpty) {
              yield val;
            }
            queue.shift();
            maybeResume();
          }
          await new Promise2((resolve) => {
            next = resolve;
          });
        }
      } finally {
        done = true;
        if (resume) {
          resume();
          resume = null;
        }
      }
    }.call(this);
  }
  function asIndexedPairs(options = undefined) {
    if (options != null) {
      validateObject(options, "options");
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, "options.signal");
    }
    return async function* asIndexedPairs() {
      let index = 0;
      for await (const val of this) {
        var _options$signal;
        if (options !== null && options !== undefined && (_options$signal = options.signal) !== null && _options$signal !== undefined && _options$signal.aborted) {
          throw new AbortError({
            cause: options.signal.reason
          });
        }
        yield [index++, val];
      }
    }.call(this);
  }
  async function some(fn, options = undefined) {
    for await (const unused of filter.call(this, fn, options)) {
      return true;
    }
    return false;
  }
  async function every(fn, options = undefined) {
    if (typeof fn !== "function") {
      throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
    }
    return !await some.call(this, async (...args) => {
      return !await fn(...args);
    }, options);
  }
  async function find(fn, options) {
    for await (const result of filter.call(this, fn, options)) {
      return result;
    }
    return;
  }
  async function forEach(fn, options) {
    if (typeof fn !== "function") {
      throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
    }
    async function forEachFn(value, options2) {
      await fn(value, options2);
      return kEmpty;
    }
    for await (const unused of map.call(this, forEachFn, options))
      ;
  }
  function filter(fn, options) {
    if (typeof fn !== "function") {
      throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
    }
    async function filterFn(value, options2) {
      if (await fn(value, options2)) {
        return value;
      }
      return kEmpty;
    }
    return map.call(this, filterFn, options);
  }

  class ReduceAwareErrMissingArgs extends ERR_MISSING_ARGS {
    constructor() {
      super("reduce");
      this.message = "Reduce of an empty stream requires an initial value";
    }
  }
  async function reduce(reducer, initialValue, options) {
    var _options$signal2;
    if (typeof reducer !== "function") {
      throw new ERR_INVALID_ARG_TYPE("reducer", ["Function", "AsyncFunction"], reducer);
    }
    if (options != null) {
      validateObject(options, "options");
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, "options.signal");
    }
    let hasInitialValue = arguments.length > 1;
    if (options !== null && options !== undefined && (_options$signal2 = options.signal) !== null && _options$signal2 !== undefined && _options$signal2.aborted) {
      const err = new AbortError(undefined, {
        cause: options.signal.reason
      });
      this.once("error", () => {});
      await finished(this.destroy(err));
      throw err;
    }
    const ac = new AbortController;
    const signal = ac.signal;
    if (options !== null && options !== undefined && options.signal) {
      const opts = {
        once: true,
        [kWeakHandler]: this,
        [kResistStopPropagation]: true
      };
      options.signal.addEventListener("abort", () => ac.abort(), opts);
    }
    let gotAnyItemFromStream = false;
    try {
      for await (const value of this) {
        var _options$signal3;
        gotAnyItemFromStream = true;
        if (options !== null && options !== undefined && (_options$signal3 = options.signal) !== null && _options$signal3 !== undefined && _options$signal3.aborted) {
          throw new AbortError;
        }
        if (!hasInitialValue) {
          initialValue = value;
          hasInitialValue = true;
        } else {
          initialValue = await reducer(initialValue, value, {
            signal
          });
        }
      }
      if (!gotAnyItemFromStream && !hasInitialValue) {
        throw new ReduceAwareErrMissingArgs;
      }
    } finally {
      ac.abort();
    }
    return initialValue;
  }
  async function toArray(options) {
    if (options != null) {
      validateObject(options, "options");
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, "options.signal");
    }
    const result = [];
    for await (const val of this) {
      var _options$signal4;
      if (options !== null && options !== undefined && (_options$signal4 = options.signal) !== null && _options$signal4 !== undefined && _options$signal4.aborted) {
        throw new AbortError(undefined, {
          cause: options.signal.reason
        });
      }
      ArrayPrototypePush(result, val);
    }
    return result;
  }
  function flatMap(fn, options) {
    const values = map.call(this, fn, options);
    return async function* flatMap() {
      for await (const val of values) {
        yield* val;
      }
    }.call(this);
  }
  function toIntegerOrInfinity(number) {
    number = Number2(number);
    if (NumberIsNaN(number)) {
      return 0;
    }
    if (number < 0) {
      throw new ERR_OUT_OF_RANGE("number", ">= 0", number);
    }
    return number;
  }
  function drop(number, options = undefined) {
    if (options != null) {
      validateObject(options, "options");
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, "options.signal");
    }
    number = toIntegerOrInfinity(number);
    return async function* drop() {
      var _options$signal5;
      if (options !== null && options !== undefined && (_options$signal5 = options.signal) !== null && _options$signal5 !== undefined && _options$signal5.aborted) {
        throw new AbortError;
      }
      for await (const val of this) {
        var _options$signal6;
        if (options !== null && options !== undefined && (_options$signal6 = options.signal) !== null && _options$signal6 !== undefined && _options$signal6.aborted) {
          throw new AbortError;
        }
        if (number-- <= 0) {
          yield val;
        }
      }
    }.call(this);
  }
  function take(number, options = undefined) {
    if (options != null) {
      validateObject(options, "options");
    }
    if ((options === null || options === undefined ? undefined : options.signal) != null) {
      validateAbortSignal(options.signal, "options.signal");
    }
    number = toIntegerOrInfinity(number);
    return async function* take() {
      var _options$signal7;
      if (options !== null && options !== undefined && (_options$signal7 = options.signal) !== null && _options$signal7 !== undefined && _options$signal7.aborted) {
        throw new AbortError;
      }
      for await (const val of this) {
        var _options$signal8;
        if (options !== null && options !== undefined && (_options$signal8 = options.signal) !== null && _options$signal8 !== undefined && _options$signal8.aborted) {
          throw new AbortError;
        }
        if (number-- > 0) {
          yield val;
        }
        if (number <= 0) {
          return;
        }
      }
    }.call(this);
  }
  exports.streamReturningOperators = {
    asIndexedPairs: deprecate(asIndexedPairs, "readable.asIndexedPairs will be removed in a future version."),
    drop,
    filter,
    flatMap,
    map,
    take,
    compose
  };
  exports.promiseReturningOperators = {
    every,
    forEach,
    reduce,
    toArray,
    some,
    find
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/stream/promises.js
var require_promises = __commonJS((exports, module) => {
  var { ArrayPrototypePop, Promise: Promise2 } = require_primordials();
  var { isIterable, isNodeStream, isWebStream } = require_utils();
  var { pipelineImpl: pl } = require_pipeline();
  var { finished } = require_end_of_stream();
  require_stream();
  function pipeline(...streams) {
    return new Promise2((resolve, reject) => {
      let signal;
      let end;
      const lastArg = streams[streams.length - 1];
      if (lastArg && typeof lastArg === "object" && !isNodeStream(lastArg) && !isIterable(lastArg) && !isWebStream(lastArg)) {
        const options = ArrayPrototypePop(streams);
        signal = options.signal;
        end = options.end;
      }
      pl(streams, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      }, {
        signal,
        end
      });
    });
  }
  module.exports = {
    finished,
    pipeline
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/stream.js
var require_stream = __commonJS((exports, module) => {
  var { Buffer: Buffer2 } = __require("buffer");
  var { ObjectDefineProperty, ObjectKeys, ReflectApply } = require_primordials();
  var {
    promisify: { custom: customPromisify }
  } = require_util2();
  var { streamReturningOperators, promiseReturningOperators } = require_operators();
  var {
    codes: { ERR_ILLEGAL_CONSTRUCTOR }
  } = require_errors();
  var compose = require_compose();
  var { setDefaultHighWaterMark, getDefaultHighWaterMark } = require_state();
  var { pipeline } = require_pipeline();
  var { destroyer } = require_destroy2();
  var eos = require_end_of_stream();
  var promises = require_promises();
  var utils = require_utils();
  var Stream = module.exports = require_legacy().Stream;
  Stream.isDestroyed = utils.isDestroyed;
  Stream.isDisturbed = utils.isDisturbed;
  Stream.isErrored = utils.isErrored;
  Stream.isReadable = utils.isReadable;
  Stream.isWritable = utils.isWritable;
  Stream.Readable = require_readable2();
  for (const key of ObjectKeys(streamReturningOperators)) {
    let fn = function(...args) {
      if (new.target) {
        throw ERR_ILLEGAL_CONSTRUCTOR();
      }
      return Stream.Readable.from(ReflectApply(op, this, args));
    };
    const op = streamReturningOperators[key];
    ObjectDefineProperty(fn, "name", {
      __proto__: null,
      value: op.name
    });
    ObjectDefineProperty(fn, "length", {
      __proto__: null,
      value: op.length
    });
    ObjectDefineProperty(Stream.Readable.prototype, key, {
      __proto__: null,
      value: fn,
      enumerable: false,
      configurable: true,
      writable: true
    });
  }
  for (const key of ObjectKeys(promiseReturningOperators)) {
    let fn = function(...args) {
      if (new.target) {
        throw ERR_ILLEGAL_CONSTRUCTOR();
      }
      return ReflectApply(op, this, args);
    };
    const op = promiseReturningOperators[key];
    ObjectDefineProperty(fn, "name", {
      __proto__: null,
      value: op.name
    });
    ObjectDefineProperty(fn, "length", {
      __proto__: null,
      value: op.length
    });
    ObjectDefineProperty(Stream.Readable.prototype, key, {
      __proto__: null,
      value: fn,
      enumerable: false,
      configurable: true,
      writable: true
    });
  }
  Stream.Writable = require_writable();
  Stream.Duplex = require_duplex();
  Stream.Transform = require_transform();
  Stream.PassThrough = require_passthrough2();
  Stream.pipeline = pipeline;
  var { addAbortSignal } = require_add_abort_signal();
  Stream.addAbortSignal = addAbortSignal;
  Stream.finished = eos;
  Stream.destroy = destroyer;
  Stream.compose = compose;
  Stream.setDefaultHighWaterMark = setDefaultHighWaterMark;
  Stream.getDefaultHighWaterMark = getDefaultHighWaterMark;
  ObjectDefineProperty(Stream, "promises", {
    __proto__: null,
    configurable: true,
    enumerable: true,
    get() {
      return promises;
    }
  });
  ObjectDefineProperty(pipeline, customPromisify, {
    __proto__: null,
    enumerable: true,
    get() {
      return promises.pipeline;
    }
  });
  ObjectDefineProperty(eos, customPromisify, {
    __proto__: null,
    enumerable: true,
    get() {
      return promises.finished;
    }
  });
  Stream.Stream = Stream;
  Stream._isUint8Array = function isUint8Array(value) {
    return value instanceof Uint8Array;
  };
  Stream._uint8ArrayToBuffer = function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  };
});

// ../../node_modules/.pnpm/readable-stream@4.7.0/node_modules/readable-stream/lib/ours/index.js
var require_ours = __commonJS((exports, module) => {
  var Stream = __require("stream");
  if (Stream && process.env.READABLE_STREAM === "disable") {
    const promises = Stream.promises;
    module.exports._uint8ArrayToBuffer = Stream._uint8ArrayToBuffer;
    module.exports._isUint8Array = Stream._isUint8Array;
    module.exports.isDisturbed = Stream.isDisturbed;
    module.exports.isErrored = Stream.isErrored;
    module.exports.isReadable = Stream.isReadable;
    module.exports.Readable = Stream.Readable;
    module.exports.Writable = Stream.Writable;
    module.exports.Duplex = Stream.Duplex;
    module.exports.Transform = Stream.Transform;
    module.exports.PassThrough = Stream.PassThrough;
    module.exports.addAbortSignal = Stream.addAbortSignal;
    module.exports.finished = Stream.finished;
    module.exports.destroy = Stream.destroy;
    module.exports.pipeline = Stream.pipeline;
    module.exports.compose = Stream.compose;
    Object.defineProperty(Stream, "promises", {
      configurable: true,
      enumerable: true,
      get() {
        return promises;
      }
    });
    module.exports.Stream = Stream.Stream;
  } else {
    const CustomStream = require_stream();
    const promises = require_promises();
    const originalDestroy = CustomStream.Readable.destroy;
    module.exports = CustomStream.Readable;
    module.exports._uint8ArrayToBuffer = CustomStream._uint8ArrayToBuffer;
    module.exports._isUint8Array = CustomStream._isUint8Array;
    module.exports.isDisturbed = CustomStream.isDisturbed;
    module.exports.isErrored = CustomStream.isErrored;
    module.exports.isReadable = CustomStream.isReadable;
    module.exports.Readable = CustomStream.Readable;
    module.exports.Writable = CustomStream.Writable;
    module.exports.Duplex = CustomStream.Duplex;
    module.exports.Transform = CustomStream.Transform;
    module.exports.PassThrough = CustomStream.PassThrough;
    module.exports.addAbortSignal = CustomStream.addAbortSignal;
    module.exports.finished = CustomStream.finished;
    module.exports.destroy = CustomStream.destroy;
    module.exports.destroy = originalDestroy;
    module.exports.pipeline = CustomStream.pipeline;
    module.exports.compose = CustomStream.compose;
    Object.defineProperty(CustomStream, "promises", {
      configurable: true,
      enumerable: true,
      get() {
        return promises;
      }
    });
    module.exports.Stream = CustomStream.Stream;
  }
  module.exports.default = module.exports;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayPush.js
var require__arrayPush = __commonJS((exports, module) => {
  function arrayPush(array, values) {
    var index = -1, length = values.length, offset = array.length;
    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }
  module.exports = arrayPush;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isFlattenable.js
var require__isFlattenable = __commonJS((exports, module) => {
  var Symbol2 = require__Symbol();
  var isArguments = require_isArguments();
  var isArray = require_isArray();
  var spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : undefined;
  function isFlattenable(value) {
    return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
  }
  module.exports = isFlattenable;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseFlatten.js
var require__baseFlatten = __commonJS((exports, module) => {
  var arrayPush = require__arrayPush();
  var isFlattenable = require__isFlattenable();
  function baseFlatten(array, depth, predicate, isStrict, result) {
    var index = -1, length = array.length;
    predicate || (predicate = isFlattenable);
    result || (result = []);
    while (++index < length) {
      var value = array[index];
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }
  module.exports = baseFlatten;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/flatten.js
var require_flatten = __commonJS((exports, module) => {
  var baseFlatten = require__baseFlatten();
  function flatten(array) {
    var length = array == null ? 0 : array.length;
    return length ? baseFlatten(array, 1) : [];
  }
  module.exports = flatten;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeCreate.js
var require__nativeCreate = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var nativeCreate = getNative(Object, "create");
  module.exports = nativeCreate;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashClear.js
var require__hashClear = __commonJS((exports, module) => {
  var nativeCreate = require__nativeCreate();
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }
  module.exports = hashClear;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashDelete.js
var require__hashDelete = __commonJS((exports, module) => {
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  module.exports = hashDelete;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashGet.js
var require__hashGet = __commonJS((exports, module) => {
  var nativeCreate = require__nativeCreate();
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : undefined;
  }
  module.exports = hashGet;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashHas.js
var require__hashHas = __commonJS((exports, module) => {
  var nativeCreate = require__nativeCreate();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
  }
  module.exports = hashHas;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashSet.js
var require__hashSet = __commonJS((exports, module) => {
  var nativeCreate = require__nativeCreate();
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
    return this;
  }
  module.exports = hashSet;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Hash.js
var require__Hash = __commonJS((exports, module) => {
  var hashClear = require__hashClear();
  var hashDelete = require__hashDelete();
  var hashGet = require__hashGet();
  var hashHas = require__hashHas();
  var hashSet = require__hashSet();
  function Hash(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype["delete"] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  module.exports = Hash;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheClear.js
var require__listCacheClear = __commonJS((exports, module) => {
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  module.exports = listCacheClear;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_assocIndexOf.js
var require__assocIndexOf = __commonJS((exports, module) => {
  var eq = require_eq();
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  module.exports = assocIndexOf;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheDelete.js
var require__listCacheDelete = __commonJS((exports, module) => {
  var assocIndexOf = require__assocIndexOf();
  var arrayProto = Array.prototype;
  var splice = arrayProto.splice;
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }
  module.exports = listCacheDelete;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheGet.js
var require__listCacheGet = __commonJS((exports, module) => {
  var assocIndexOf = require__assocIndexOf();
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    return index < 0 ? undefined : data[index][1];
  }
  module.exports = listCacheGet;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheHas.js
var require__listCacheHas = __commonJS((exports, module) => {
  var assocIndexOf = require__assocIndexOf();
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  module.exports = listCacheHas;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheSet.js
var require__listCacheSet = __commonJS((exports, module) => {
  var assocIndexOf = require__assocIndexOf();
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  module.exports = listCacheSet;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_ListCache.js
var require__ListCache = __commonJS((exports, module) => {
  var listCacheClear = require__listCacheClear();
  var listCacheDelete = require__listCacheDelete();
  var listCacheGet = require__listCacheGet();
  var listCacheHas = require__listCacheHas();
  var listCacheSet = require__listCacheSet();
  function ListCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype["delete"] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  module.exports = ListCache;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Map.js
var require__Map = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var root = require__root();
  var Map2 = getNative(root, "Map");
  module.exports = Map2;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheClear.js
var require__mapCacheClear = __commonJS((exports, module) => {
  var Hash = require__Hash();
  var ListCache = require__ListCache();
  var Map2 = require__Map();
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      hash: new Hash,
      map: new (Map2 || ListCache),
      string: new Hash
    };
  }
  module.exports = mapCacheClear;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isKeyable.js
var require__isKeyable = __commonJS((exports, module) => {
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  module.exports = isKeyable;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getMapData.js
var require__getMapData = __commonJS((exports, module) => {
  var isKeyable = require__isKeyable();
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  module.exports = getMapData;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheDelete.js
var require__mapCacheDelete = __commonJS((exports, module) => {
  var getMapData = require__getMapData();
  function mapCacheDelete(key) {
    var result = getMapData(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  module.exports = mapCacheDelete;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheGet.js
var require__mapCacheGet = __commonJS((exports, module) => {
  var getMapData = require__getMapData();
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  module.exports = mapCacheGet;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheHas.js
var require__mapCacheHas = __commonJS((exports, module) => {
  var getMapData = require__getMapData();
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  module.exports = mapCacheHas;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheSet.js
var require__mapCacheSet = __commonJS((exports, module) => {
  var getMapData = require__getMapData();
  function mapCacheSet(key, value) {
    var data = getMapData(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  module.exports = mapCacheSet;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_MapCache.js
var require__MapCache = __commonJS((exports, module) => {
  var mapCacheClear = require__mapCacheClear();
  var mapCacheDelete = require__mapCacheDelete();
  var mapCacheGet = require__mapCacheGet();
  var mapCacheHas = require__mapCacheHas();
  var mapCacheSet = require__mapCacheSet();
  function MapCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype["delete"] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  module.exports = MapCache;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setCacheAdd.js
var require__setCacheAdd = __commonJS((exports, module) => {
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED);
    return this;
  }
  module.exports = setCacheAdd;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setCacheHas.js
var require__setCacheHas = __commonJS((exports, module) => {
  function setCacheHas(value) {
    return this.__data__.has(value);
  }
  module.exports = setCacheHas;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_SetCache.js
var require__SetCache = __commonJS((exports, module) => {
  var MapCache = require__MapCache();
  var setCacheAdd = require__setCacheAdd();
  var setCacheHas = require__setCacheHas();
  function SetCache(values) {
    var index = -1, length = values == null ? 0 : values.length;
    this.__data__ = new MapCache;
    while (++index < length) {
      this.add(values[index]);
    }
  }
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
  SetCache.prototype.has = setCacheHas;
  module.exports = SetCache;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseFindIndex.js
var require__baseFindIndex = __commonJS((exports, module) => {
  function baseFindIndex(array, predicate, fromIndex, fromRight) {
    var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
    while (fromRight ? index-- : ++index < length) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }
  module.exports = baseFindIndex;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsNaN.js
var require__baseIsNaN = __commonJS((exports, module) => {
  function baseIsNaN(value) {
    return value !== value;
  }
  module.exports = baseIsNaN;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_strictIndexOf.js
var require__strictIndexOf = __commonJS((exports, module) => {
  function strictIndexOf(array, value, fromIndex) {
    var index = fromIndex - 1, length = array.length;
    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }
  module.exports = strictIndexOf;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIndexOf.js
var require__baseIndexOf = __commonJS((exports, module) => {
  var baseFindIndex = require__baseFindIndex();
  var baseIsNaN = require__baseIsNaN();
  var strictIndexOf = require__strictIndexOf();
  function baseIndexOf(array, value, fromIndex) {
    return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
  }
  module.exports = baseIndexOf;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayIncludes.js
var require__arrayIncludes = __commonJS((exports, module) => {
  var baseIndexOf = require__baseIndexOf();
  function arrayIncludes(array, value) {
    var length = array == null ? 0 : array.length;
    return !!length && baseIndexOf(array, value, 0) > -1;
  }
  module.exports = arrayIncludes;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayIncludesWith.js
var require__arrayIncludesWith = __commonJS((exports, module) => {
  function arrayIncludesWith(array, value, comparator) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
      if (comparator(value, array[index])) {
        return true;
      }
    }
    return false;
  }
  module.exports = arrayIncludesWith;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayMap.js
var require__arrayMap = __commonJS((exports, module) => {
  function arrayMap(array, iteratee) {
    var index = -1, length = array == null ? 0 : array.length, result = Array(length);
    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }
  module.exports = arrayMap;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cacheHas.js
var require__cacheHas = __commonJS((exports, module) => {
  function cacheHas(cache, key) {
    return cache.has(key);
  }
  module.exports = cacheHas;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseDifference.js
var require__baseDifference = __commonJS((exports, module) => {
  var SetCache = require__SetCache();
  var arrayIncludes = require__arrayIncludes();
  var arrayIncludesWith = require__arrayIncludesWith();
  var arrayMap = require__arrayMap();
  var baseUnary = require__baseUnary();
  var cacheHas = require__cacheHas();
  var LARGE_ARRAY_SIZE = 200;
  function baseDifference(array, values, iteratee, comparator) {
    var index = -1, includes = arrayIncludes, isCommon = true, length = array.length, result = [], valuesLength = values.length;
    if (!length) {
      return result;
    }
    if (iteratee) {
      values = arrayMap(values, baseUnary(iteratee));
    }
    if (comparator) {
      includes = arrayIncludesWith;
      isCommon = false;
    } else if (values.length >= LARGE_ARRAY_SIZE) {
      includes = cacheHas;
      isCommon = false;
      values = new SetCache(values);
    }
    outer:
      while (++index < length) {
        var value = array[index], computed = iteratee == null ? value : iteratee(value);
        value = comparator || value !== 0 ? value : 0;
        if (isCommon && computed === computed) {
          var valuesIndex = valuesLength;
          while (valuesIndex--) {
            if (values[valuesIndex] === computed) {
              continue outer;
            }
          }
          result.push(value);
        } else if (!includes(values, computed, comparator)) {
          result.push(value);
        }
      }
    return result;
  }
  module.exports = baseDifference;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArrayLikeObject.js
var require_isArrayLikeObject = __commonJS((exports, module) => {
  var isArrayLike = require_isArrayLike();
  var isObjectLike = require_isObjectLike();
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }
  module.exports = isArrayLikeObject;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/difference.js
var require_difference = __commonJS((exports, module) => {
  var baseDifference = require__baseDifference();
  var baseFlatten = require__baseFlatten();
  var baseRest = require__baseRest();
  var isArrayLikeObject = require_isArrayLikeObject();
  var difference = baseRest(function(array, values) {
    return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true)) : [];
  });
  module.exports = difference;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Set.js
var require__Set = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var root = require__root();
  var Set2 = getNative(root, "Set");
  module.exports = Set2;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/noop.js
var require_noop = __commonJS((exports, module) => {
  function noop() {}
  module.exports = noop;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setToArray.js
var require__setToArray = __commonJS((exports, module) => {
  function setToArray(set) {
    var index = -1, result = Array(set.size);
    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }
  module.exports = setToArray;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createSet.js
var require__createSet = __commonJS((exports, module) => {
  var Set2 = require__Set();
  var noop = require_noop();
  var setToArray = require__setToArray();
  var INFINITY = 1 / 0;
  var createSet = !(Set2 && 1 / setToArray(new Set2([, -0]))[1] == INFINITY) ? noop : function(values) {
    return new Set2(values);
  };
  module.exports = createSet;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseUniq.js
var require__baseUniq = __commonJS((exports, module) => {
  var SetCache = require__SetCache();
  var arrayIncludes = require__arrayIncludes();
  var arrayIncludesWith = require__arrayIncludesWith();
  var cacheHas = require__cacheHas();
  var createSet = require__createSet();
  var setToArray = require__setToArray();
  var LARGE_ARRAY_SIZE = 200;
  function baseUniq(array, iteratee, comparator) {
    var index = -1, includes = arrayIncludes, length = array.length, isCommon = true, result = [], seen = result;
    if (comparator) {
      isCommon = false;
      includes = arrayIncludesWith;
    } else if (length >= LARGE_ARRAY_SIZE) {
      var set = iteratee ? null : createSet(array);
      if (set) {
        return setToArray(set);
      }
      isCommon = false;
      includes = cacheHas;
      seen = new SetCache;
    } else {
      seen = iteratee ? [] : result;
    }
    outer:
      while (++index < length) {
        var value = array[index], computed = iteratee ? iteratee(value) : value;
        value = comparator || value !== 0 ? value : 0;
        if (isCommon && computed === computed) {
          var seenIndex = seen.length;
          while (seenIndex--) {
            if (seen[seenIndex] === computed) {
              continue outer;
            }
          }
          if (iteratee) {
            seen.push(computed);
          }
          result.push(value);
        } else if (!includes(seen, computed, comparator)) {
          if (seen !== result) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
    return result;
  }
  module.exports = baseUniq;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/union.js
var require_union = __commonJS((exports, module) => {
  var baseFlatten = require__baseFlatten();
  var baseRest = require__baseRest();
  var baseUniq = require__baseUniq();
  var isArrayLikeObject = require_isArrayLikeObject();
  var union = baseRest(function(arrays) {
    return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
  });
  module.exports = union;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_overArg.js
var require__overArg = __commonJS((exports, module) => {
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }
  module.exports = overArg;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getPrototype.js
var require__getPrototype = __commonJS((exports, module) => {
  var overArg = require__overArg();
  var getPrototype = overArg(Object.getPrototypeOf, Object);
  module.exports = getPrototype;
});

// ../../node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isPlainObject.js
var require_isPlainObject = __commonJS((exports, module) => {
  var baseGetTag = require__baseGetTag();
  var getPrototype = require__getPrototype();
  var isObjectLike = require_isObjectLike();
  var objectTag = "[object Object]";
  var funcProto = Function.prototype;
  var objectProto = Object.prototype;
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var objectCtorString = funcToString.call(Object);
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
  }
  module.exports = isPlainObject;
});

// ../../node_modules/.pnpm/minimatch@9.0.5/node_modules/minimatch/dist/commonjs/assert-valid-pattern.js
var require_assert_valid_pattern = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.assertValidPattern = undefined;
  var MAX_PATTERN_LENGTH = 1024 * 64;
  var assertValidPattern = (pattern) => {
    if (typeof pattern !== "string") {
      throw new TypeError("invalid pattern");
    }
    if (pattern.length > MAX_PATTERN_LENGTH) {
      throw new TypeError("pattern is too long");
    }
  };
  exports.assertValidPattern = assertValidPattern;
});

// ../../node_modules/.pnpm/minimatch@9.0.5/node_modules/minimatch/dist/commonjs/brace-expressions.js
var require_brace_expressions = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.parseClass = undefined;
  var posixClasses = {
    "[:alnum:]": ["\\p{L}\\p{Nl}\\p{Nd}", true],
    "[:alpha:]": ["\\p{L}\\p{Nl}", true],
    "[:ascii:]": ["\\x" + "00-\\x" + "7f", false],
    "[:blank:]": ["\\p{Zs}\\t", true],
    "[:cntrl:]": ["\\p{Cc}", true],
    "[:digit:]": ["\\p{Nd}", true],
    "[:graph:]": ["\\p{Z}\\p{C}", true, true],
    "[:lower:]": ["\\p{Ll}", true],
    "[:print:]": ["\\p{C}", true],
    "[:punct:]": ["\\p{P}", true],
    "[:space:]": ["\\p{Z}\\t\\r\\n\\v\\f", true],
    "[:upper:]": ["\\p{Lu}", true],
    "[:word:]": ["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}", true],
    "[:xdigit:]": ["A-Fa-f0-9", false]
  };
  var braceEscape = (s) => s.replace(/[[\]\\-]/g, "\\$&");
  var regexpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  var rangesToString = (ranges) => ranges.join("");
  var parseClass = (glob, position) => {
    const pos = position;
    if (glob.charAt(pos) !== "[") {
      throw new Error("not in a brace expression");
    }
    const ranges = [];
    const negs = [];
    let i = pos + 1;
    let sawStart = false;
    let uflag = false;
    let escaping = false;
    let negate = false;
    let endPos = pos;
    let rangeStart = "";
    WHILE:
      while (i < glob.length) {
        const c = glob.charAt(i);
        if ((c === "!" || c === "^") && i === pos + 1) {
          negate = true;
          i++;
          continue;
        }
        if (c === "]" && sawStart && !escaping) {
          endPos = i + 1;
          break;
        }
        sawStart = true;
        if (c === "\\") {
          if (!escaping) {
            escaping = true;
            i++;
            continue;
          }
        }
        if (c === "[" && !escaping) {
          for (const [cls, [unip, u, neg]] of Object.entries(posixClasses)) {
            if (glob.startsWith(cls, i)) {
              if (rangeStart) {
                return ["$.", false, glob.length - pos, true];
              }
              i += cls.length;
              if (neg)
                negs.push(unip);
              else
                ranges.push(unip);
              uflag = uflag || u;
              continue WHILE;
            }
          }
        }
        escaping = false;
        if (rangeStart) {
          if (c > rangeStart) {
            ranges.push(braceEscape(rangeStart) + "-" + braceEscape(c));
          } else if (c === rangeStart) {
            ranges.push(braceEscape(c));
          }
          rangeStart = "";
          i++;
          continue;
        }
        if (glob.startsWith("-]", i + 1)) {
          ranges.push(braceEscape(c + "-"));
          i += 2;
          continue;
        }
        if (glob.startsWith("-", i + 1)) {
          rangeStart = c;
          i += 2;
          continue;
        }
        ranges.push(braceEscape(c));
        i++;
      }
    if (endPos < i) {
      return ["", false, 0, false];
    }
    if (!ranges.length && !negs.length) {
      return ["$.", false, glob.length - pos, true];
    }
    if (negs.length === 0 && ranges.length === 1 && /^\\?.$/.test(ranges[0]) && !negate) {
      const r = ranges[0].length === 2 ? ranges[0].slice(-1) : ranges[0];
      return [regexpEscape(r), false, endPos - pos, false];
    }
    const sranges = "[" + (negate ? "^" : "") + rangesToString(ranges) + "]";
    const snegs = "[" + (negate ? "" : "^") + rangesToString(negs) + "]";
    const comb = ranges.length && negs.length ? "(" + sranges + "|" + snegs + ")" : ranges.length ? sranges : snegs;
    return [comb, uflag, endPos - pos, true];
  };
  exports.parseClass = parseClass;
});

// ../../node_modules/.pnpm/minimatch@9.0.5/node_modules/minimatch/dist/commonjs/unescape.js
var require_unescape = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.unescape = undefined;
  var unescape = (s, { windowsPathsNoEscape = false } = {}) => {
    return windowsPathsNoEscape ? s.replace(/\[([^\/\\])\]/g, "$1") : s.replace(/((?!\\).|^)\[([^\/\\])\]/g, "$1$2").replace(/\\([^\/])/g, "$1");
  };
  exports.unescape = unescape;
});

// ../../node_modules/.pnpm/minimatch@9.0.5/node_modules/minimatch/dist/commonjs/ast.js
var require_ast = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.AST = undefined;
  var brace_expressions_js_1 = require_brace_expressions();
  var unescape_js_1 = require_unescape();
  var types = new Set(["!", "?", "+", "*", "@"]);
  var isExtglobType = (c) => types.has(c);
  var startNoTraversal = "(?!(?:^|/)\\.\\.?(?:$|/))";
  var startNoDot = "(?!\\.)";
  var addPatternStart = new Set(["[", "."]);
  var justDots = new Set(["..", "."]);
  var reSpecials = new Set("().*{}+?[]^$\\!");
  var regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  var qmark = "[^/]";
  var star = qmark + "*?";
  var starNoEmpty = qmark + "+?";

  class AST {
    type;
    #root;
    #hasMagic;
    #uflag = false;
    #parts = [];
    #parent;
    #parentIndex;
    #negs;
    #filledNegs = false;
    #options;
    #toString;
    #emptyExt = false;
    constructor(type, parent, options = {}) {
      this.type = type;
      if (type)
        this.#hasMagic = true;
      this.#parent = parent;
      this.#root = this.#parent ? this.#parent.#root : this;
      this.#options = this.#root === this ? options : this.#root.#options;
      this.#negs = this.#root === this ? [] : this.#root.#negs;
      if (type === "!" && !this.#root.#filledNegs)
        this.#negs.push(this);
      this.#parentIndex = this.#parent ? this.#parent.#parts.length : 0;
    }
    get hasMagic() {
      if (this.#hasMagic !== undefined)
        return this.#hasMagic;
      for (const p of this.#parts) {
        if (typeof p === "string")
          continue;
        if (p.type || p.hasMagic)
          return this.#hasMagic = true;
      }
      return this.#hasMagic;
    }
    toString() {
      if (this.#toString !== undefined)
        return this.#toString;
      if (!this.type) {
        return this.#toString = this.#parts.map((p) => String(p)).join("");
      } else {
        return this.#toString = this.type + "(" + this.#parts.map((p) => String(p)).join("|") + ")";
      }
    }
    #fillNegs() {
      if (this !== this.#root)
        throw new Error("should only call on root");
      if (this.#filledNegs)
        return this;
      this.toString();
      this.#filledNegs = true;
      let n;
      while (n = this.#negs.pop()) {
        if (n.type !== "!")
          continue;
        let p = n;
        let pp = p.#parent;
        while (pp) {
          for (let i = p.#parentIndex + 1;!pp.type && i < pp.#parts.length; i++) {
            for (const part of n.#parts) {
              if (typeof part === "string") {
                throw new Error("string part in extglob AST??");
              }
              part.copyIn(pp.#parts[i]);
            }
          }
          p = pp;
          pp = p.#parent;
        }
      }
      return this;
    }
    push(...parts) {
      for (const p of parts) {
        if (p === "")
          continue;
        if (typeof p !== "string" && !(p instanceof AST && p.#parent === this)) {
          throw new Error("invalid part: " + p);
        }
        this.#parts.push(p);
      }
    }
    toJSON() {
      const ret = this.type === null ? this.#parts.slice().map((p) => typeof p === "string" ? p : p.toJSON()) : [this.type, ...this.#parts.map((p) => p.toJSON())];
      if (this.isStart() && !this.type)
        ret.unshift([]);
      if (this.isEnd() && (this === this.#root || this.#root.#filledNegs && this.#parent?.type === "!")) {
        ret.push({});
      }
      return ret;
    }
    isStart() {
      if (this.#root === this)
        return true;
      if (!this.#parent?.isStart())
        return false;
      if (this.#parentIndex === 0)
        return true;
      const p = this.#parent;
      for (let i = 0;i < this.#parentIndex; i++) {
        const pp = p.#parts[i];
        if (!(pp instanceof AST && pp.type === "!")) {
          return false;
        }
      }
      return true;
    }
    isEnd() {
      if (this.#root === this)
        return true;
      if (this.#parent?.type === "!")
        return true;
      if (!this.#parent?.isEnd())
        return false;
      if (!this.type)
        return this.#parent?.isEnd();
      const pl = this.#parent ? this.#parent.#parts.length : 0;
      return this.#parentIndex === pl - 1;
    }
    copyIn(part) {
      if (typeof part === "string")
        this.push(part);
      else
        this.push(part.clone(this));
    }
    clone(parent) {
      const c = new AST(this.type, parent);
      for (const p of this.#parts) {
        c.copyIn(p);
      }
      return c;
    }
    static #parseAST(str, ast, pos, opt) {
      let escaping = false;
      let inBrace = false;
      let braceStart = -1;
      let braceNeg = false;
      if (ast.type === null) {
        let i2 = pos;
        let acc2 = "";
        while (i2 < str.length) {
          const c = str.charAt(i2++);
          if (escaping || c === "\\") {
            escaping = !escaping;
            acc2 += c;
            continue;
          }
          if (inBrace) {
            if (i2 === braceStart + 1) {
              if (c === "^" || c === "!") {
                braceNeg = true;
              }
            } else if (c === "]" && !(i2 === braceStart + 2 && braceNeg)) {
              inBrace = false;
            }
            acc2 += c;
            continue;
          } else if (c === "[") {
            inBrace = true;
            braceStart = i2;
            braceNeg = false;
            acc2 += c;
            continue;
          }
          if (!opt.noext && isExtglobType(c) && str.charAt(i2) === "(") {
            ast.push(acc2);
            acc2 = "";
            const ext = new AST(c, ast);
            i2 = AST.#parseAST(str, ext, i2, opt);
            ast.push(ext);
            continue;
          }
          acc2 += c;
        }
        ast.push(acc2);
        return i2;
      }
      let i = pos + 1;
      let part = new AST(null, ast);
      const parts = [];
      let acc = "";
      while (i < str.length) {
        const c = str.charAt(i++);
        if (escaping || c === "\\") {
          escaping = !escaping;
          acc += c;
          continue;
        }
        if (inBrace) {
          if (i === braceStart + 1) {
            if (c === "^" || c === "!") {
              braceNeg = true;
            }
          } else if (c === "]" && !(i === braceStart + 2 && braceNeg)) {
            inBrace = false;
          }
          acc += c;
          continue;
        } else if (c === "[") {
          inBrace = true;
          braceStart = i;
          braceNeg = false;
          acc += c;
          continue;
        }
        if (isExtglobType(c) && str.charAt(i) === "(") {
          part.push(acc);
          acc = "";
          const ext = new AST(c, part);
          part.push(ext);
          i = AST.#parseAST(str, ext, i, opt);
          continue;
        }
        if (c === "|") {
          part.push(acc);
          acc = "";
          parts.push(part);
          part = new AST(null, ast);
          continue;
        }
        if (c === ")") {
          if (acc === "" && ast.#parts.length === 0) {
            ast.#emptyExt = true;
          }
          part.push(acc);
          acc = "";
          ast.push(...parts, part);
          return i;
        }
        acc += c;
      }
      ast.type = null;
      ast.#hasMagic = undefined;
      ast.#parts = [str.substring(pos - 1)];
      return i;
    }
    static fromGlob(pattern, options = {}) {
      const ast = new AST(null, undefined, options);
      AST.#parseAST(pattern, ast, 0, options);
      return ast;
    }
    toMMPattern() {
      if (this !== this.#root)
        return this.#root.toMMPattern();
      const glob = this.toString();
      const [re, body, hasMagic, uflag] = this.toRegExpSource();
      const anyMagic = hasMagic || this.#hasMagic || this.#options.nocase && !this.#options.nocaseMagicOnly && glob.toUpperCase() !== glob.toLowerCase();
      if (!anyMagic) {
        return body;
      }
      const flags = (this.#options.nocase ? "i" : "") + (uflag ? "u" : "");
      return Object.assign(new RegExp(`^${re}$`, flags), {
        _src: re,
        _glob: glob
      });
    }
    get options() {
      return this.#options;
    }
    toRegExpSource(allowDot) {
      const dot = allowDot ?? !!this.#options.dot;
      if (this.#root === this)
        this.#fillNegs();
      if (!this.type) {
        const noEmpty = this.isStart() && this.isEnd();
        const src = this.#parts.map((p) => {
          const [re, _2, hasMagic, uflag] = typeof p === "string" ? AST.#parseGlob(p, this.#hasMagic, noEmpty) : p.toRegExpSource(allowDot);
          this.#hasMagic = this.#hasMagic || hasMagic;
          this.#uflag = this.#uflag || uflag;
          return re;
        }).join("");
        let start2 = "";
        if (this.isStart()) {
          if (typeof this.#parts[0] === "string") {
            const dotTravAllowed = this.#parts.length === 1 && justDots.has(this.#parts[0]);
            if (!dotTravAllowed) {
              const aps = addPatternStart;
              const needNoTrav = dot && aps.has(src.charAt(0)) || src.startsWith("\\.") && aps.has(src.charAt(2)) || src.startsWith("\\.\\.") && aps.has(src.charAt(4));
              const needNoDot = !dot && !allowDot && aps.has(src.charAt(0));
              start2 = needNoTrav ? startNoTraversal : needNoDot ? startNoDot : "";
            }
          }
        }
        let end = "";
        if (this.isEnd() && this.#root.#filledNegs && this.#parent?.type === "!") {
          end = "(?:$|\\/)";
        }
        const final2 = start2 + src + end;
        return [
          final2,
          (0, unescape_js_1.unescape)(src),
          this.#hasMagic = !!this.#hasMagic,
          this.#uflag
        ];
      }
      const repeated = this.type === "*" || this.type === "+";
      const start = this.type === "!" ? "(?:(?!(?:" : "(?:";
      let body = this.#partsToRegExp(dot);
      if (this.isStart() && this.isEnd() && !body && this.type !== "!") {
        const s = this.toString();
        this.#parts = [s];
        this.type = null;
        this.#hasMagic = undefined;
        return [s, (0, unescape_js_1.unescape)(this.toString()), false, false];
      }
      let bodyDotAllowed = !repeated || allowDot || dot || !startNoDot ? "" : this.#partsToRegExp(true);
      if (bodyDotAllowed === body) {
        bodyDotAllowed = "";
      }
      if (bodyDotAllowed) {
        body = `(?:${body})(?:${bodyDotAllowed})*?`;
      }
      let final = "";
      if (this.type === "!" && this.#emptyExt) {
        final = (this.isStart() && !dot ? startNoDot : "") + starNoEmpty;
      } else {
        const close = this.type === "!" ? "))" + (this.isStart() && !dot && !allowDot ? startNoDot : "") + star + ")" : this.type === "@" ? ")" : this.type === "?" ? ")?" : this.type === "+" && bodyDotAllowed ? ")" : this.type === "*" && bodyDotAllowed ? `)?` : `)${this.type}`;
        final = start + body + close;
      }
      return [
        final,
        (0, unescape_js_1.unescape)(body),
        this.#hasMagic = !!this.#hasMagic,
        this.#uflag
      ];
    }
    #partsToRegExp(dot) {
      return this.#parts.map((p) => {
        if (typeof p === "string") {
          throw new Error("string type in extglob ast??");
        }
        const [re, _2, _hasMagic, uflag] = p.toRegExpSource(dot);
        this.#uflag = this.#uflag || uflag;
        return re;
      }).filter((p) => !(this.isStart() && this.isEnd()) || !!p).join("|");
    }
    static #parseGlob(glob, hasMagic, noEmpty = false) {
      let escaping = false;
      let re = "";
      let uflag = false;
      for (let i = 0;i < glob.length; i++) {
        const c = glob.charAt(i);
        if (escaping) {
          escaping = false;
          re += (reSpecials.has(c) ? "\\" : "") + c;
          continue;
        }
        if (c === "\\") {
          if (i === glob.length - 1) {
            re += "\\\\";
          } else {
            escaping = true;
          }
          continue;
        }
        if (c === "[") {
          const [src, needUflag, consumed, magic] = (0, brace_expressions_js_1.parseClass)(glob, i);
          if (consumed) {
            re += src;
            uflag = uflag || needUflag;
            i += consumed - 1;
            hasMagic = hasMagic || magic;
            continue;
          }
        }
        if (c === "*") {
          if (noEmpty && glob === "*")
            re += starNoEmpty;
          else
            re += star;
          hasMagic = true;
          continue;
        }
        if (c === "?") {
          re += qmark;
          hasMagic = true;
          continue;
        }
        re += regExpEscape(c);
      }
      return [re, (0, unescape_js_1.unescape)(glob), !!hasMagic, uflag];
    }
  }
  exports.AST = AST;
});

// ../../node_modules/.pnpm/minimatch@9.0.5/node_modules/minimatch/dist/commonjs/escape.js
var require_escape = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.escape = undefined;
  var escape = (s, { windowsPathsNoEscape = false } = {}) => {
    return windowsPathsNoEscape ? s.replace(/[?*()[\]]/g, "[$&]") : s.replace(/[?*()[\]\\]/g, "\\$&");
  };
  exports.escape = escape;
});

// ../../node_modules/.pnpm/minimatch@9.0.5/node_modules/minimatch/dist/commonjs/index.js
var require_commonjs = __commonJS((exports) => {
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.unescape = exports.escape = exports.AST = exports.Minimatch = exports.match = exports.makeRe = exports.braceExpand = exports.defaults = exports.filter = exports.GLOBSTAR = exports.sep = exports.minimatch = undefined;
  var brace_expansion_1 = __importDefault(require_brace_expansion());
  var assert_valid_pattern_js_1 = require_assert_valid_pattern();
  var ast_js_1 = require_ast();
  var escape_js_1 = require_escape();
  var unescape_js_1 = require_unescape();
  var minimatch = (p, pattern, options = {}) => {
    (0, assert_valid_pattern_js_1.assertValidPattern)(pattern);
    if (!options.nocomment && pattern.charAt(0) === "#") {
      return false;
    }
    return new Minimatch(pattern, options).match(p);
  };
  exports.minimatch = minimatch;
  var starDotExtRE = /^\*+([^+@!?\*\[\(]*)$/;
  var starDotExtTest = (ext2) => (f) => !f.startsWith(".") && f.endsWith(ext2);
  var starDotExtTestDot = (ext2) => (f) => f.endsWith(ext2);
  var starDotExtTestNocase = (ext2) => {
    ext2 = ext2.toLowerCase();
    return (f) => !f.startsWith(".") && f.toLowerCase().endsWith(ext2);
  };
  var starDotExtTestNocaseDot = (ext2) => {
    ext2 = ext2.toLowerCase();
    return (f) => f.toLowerCase().endsWith(ext2);
  };
  var starDotStarRE = /^\*+\.\*+$/;
  var starDotStarTest = (f) => !f.startsWith(".") && f.includes(".");
  var starDotStarTestDot = (f) => f !== "." && f !== ".." && f.includes(".");
  var dotStarRE = /^\.\*+$/;
  var dotStarTest = (f) => f !== "." && f !== ".." && f.startsWith(".");
  var starRE = /^\*+$/;
  var starTest = (f) => f.length !== 0 && !f.startsWith(".");
  var starTestDot = (f) => f.length !== 0 && f !== "." && f !== "..";
  var qmarksRE = /^\?+([^+@!?\*\[\(]*)?$/;
  var qmarksTestNocase = ([$0, ext2 = ""]) => {
    const noext = qmarksTestNoExt([$0]);
    if (!ext2)
      return noext;
    ext2 = ext2.toLowerCase();
    return (f) => noext(f) && f.toLowerCase().endsWith(ext2);
  };
  var qmarksTestNocaseDot = ([$0, ext2 = ""]) => {
    const noext = qmarksTestNoExtDot([$0]);
    if (!ext2)
      return noext;
    ext2 = ext2.toLowerCase();
    return (f) => noext(f) && f.toLowerCase().endsWith(ext2);
  };
  var qmarksTestDot = ([$0, ext2 = ""]) => {
    const noext = qmarksTestNoExtDot([$0]);
    return !ext2 ? noext : (f) => noext(f) && f.endsWith(ext2);
  };
  var qmarksTest = ([$0, ext2 = ""]) => {
    const noext = qmarksTestNoExt([$0]);
    return !ext2 ? noext : (f) => noext(f) && f.endsWith(ext2);
  };
  var qmarksTestNoExt = ([$0]) => {
    const len = $0.length;
    return (f) => f.length === len && !f.startsWith(".");
  };
  var qmarksTestNoExtDot = ([$0]) => {
    const len = $0.length;
    return (f) => f.length === len && f !== "." && f !== "..";
  };
  var defaultPlatform = typeof process === "object" && process ? typeof process.env === "object" && process.env && process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform : "posix";
  var path = {
    win32: { sep: "\\" },
    posix: { sep: "/" }
  };
  exports.sep = defaultPlatform === "win32" ? path.win32.sep : path.posix.sep;
  exports.minimatch.sep = exports.sep;
  exports.GLOBSTAR = Symbol("globstar **");
  exports.minimatch.GLOBSTAR = exports.GLOBSTAR;
  var qmark = "[^/]";
  var star = qmark + "*?";
  var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
  var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
  var filter = (pattern, options = {}) => (p) => (0, exports.minimatch)(p, pattern, options);
  exports.filter = filter;
  exports.minimatch.filter = exports.filter;
  var ext = (a, b = {}) => Object.assign({}, a, b);
  var defaults = (def) => {
    if (!def || typeof def !== "object" || !Object.keys(def).length) {
      return exports.minimatch;
    }
    const orig = exports.minimatch;
    const m = (p, pattern, options = {}) => orig(p, pattern, ext(def, options));
    return Object.assign(m, {
      Minimatch: class Minimatch2 extends orig.Minimatch {
        constructor(pattern, options = {}) {
          super(pattern, ext(def, options));
        }
        static defaults(options) {
          return orig.defaults(ext(def, options)).Minimatch;
        }
      },
      AST: class AST extends orig.AST {
        constructor(type, parent, options = {}) {
          super(type, parent, ext(def, options));
        }
        static fromGlob(pattern, options = {}) {
          return orig.AST.fromGlob(pattern, ext(def, options));
        }
      },
      unescape: (s, options = {}) => orig.unescape(s, ext(def, options)),
      escape: (s, options = {}) => orig.escape(s, ext(def, options)),
      filter: (pattern, options = {}) => orig.filter(pattern, ext(def, options)),
      defaults: (options) => orig.defaults(ext(def, options)),
      makeRe: (pattern, options = {}) => orig.makeRe(pattern, ext(def, options)),
      braceExpand: (pattern, options = {}) => orig.braceExpand(pattern, ext(def, options)),
      match: (list, pattern, options = {}) => orig.match(list, pattern, ext(def, options)),
      sep: orig.sep,
      GLOBSTAR: exports.GLOBSTAR
    });
  };
  exports.defaults = defaults;
  exports.minimatch.defaults = exports.defaults;
  var braceExpand = (pattern, options = {}) => {
    (0, assert_valid_pattern_js_1.assertValidPattern)(pattern);
    if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
      return [pattern];
    }
    return (0, brace_expansion_1.default)(pattern);
  };
  exports.braceExpand = braceExpand;
  exports.minimatch.braceExpand = exports.braceExpand;
  var makeRe = (pattern, options = {}) => new Minimatch(pattern, options).makeRe();
  exports.makeRe = makeRe;
  exports.minimatch.makeRe = exports.makeRe;
  var match = (list, pattern, options = {}) => {
    const mm = new Minimatch(pattern, options);
    list = list.filter((f) => mm.match(f));
    if (mm.options.nonull && !list.length) {
      list.push(pattern);
    }
    return list;
  };
  exports.match = match;
  exports.minimatch.match = exports.match;
  var globMagic = /[?*]|[+@!]\(.*?\)|\[|\]/;
  var regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

  class Minimatch {
    options;
    set;
    pattern;
    windowsPathsNoEscape;
    nonegate;
    negate;
    comment;
    empty;
    preserveMultipleSlashes;
    partial;
    globSet;
    globParts;
    nocase;
    isWindows;
    platform;
    windowsNoMagicRoot;
    regexp;
    constructor(pattern, options = {}) {
      (0, assert_valid_pattern_js_1.assertValidPattern)(pattern);
      options = options || {};
      this.options = options;
      this.pattern = pattern;
      this.platform = options.platform || defaultPlatform;
      this.isWindows = this.platform === "win32";
      this.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options.allowWindowsEscape === false;
      if (this.windowsPathsNoEscape) {
        this.pattern = this.pattern.replace(/\\/g, "/");
      }
      this.preserveMultipleSlashes = !!options.preserveMultipleSlashes;
      this.regexp = null;
      this.negate = false;
      this.nonegate = !!options.nonegate;
      this.comment = false;
      this.empty = false;
      this.partial = !!options.partial;
      this.nocase = !!this.options.nocase;
      this.windowsNoMagicRoot = options.windowsNoMagicRoot !== undefined ? options.windowsNoMagicRoot : !!(this.isWindows && this.nocase);
      this.globSet = [];
      this.globParts = [];
      this.set = [];
      this.make();
    }
    hasMagic() {
      if (this.options.magicalBraces && this.set.length > 1) {
        return true;
      }
      for (const pattern of this.set) {
        for (const part of pattern) {
          if (typeof part !== "string")
            return true;
        }
      }
      return false;
    }
    debug(..._2) {}
    make() {
      const pattern = this.pattern;
      const options = this.options;
      if (!options.nocomment && pattern.charAt(0) === "#") {
        this.comment = true;
        return;
      }
      if (!pattern) {
        this.empty = true;
        return;
      }
      this.parseNegate();
      this.globSet = [...new Set(this.braceExpand())];
      if (options.debug) {
        this.debug = (...args) => console.error(...args);
      }
      this.debug(this.pattern, this.globSet);
      const rawGlobParts = this.globSet.map((s) => this.slashSplit(s));
      this.globParts = this.preprocess(rawGlobParts);
      this.debug(this.pattern, this.globParts);
      let set = this.globParts.map((s, _2, __) => {
        if (this.isWindows && this.windowsNoMagicRoot) {
          const isUNC = s[0] === "" && s[1] === "" && (s[2] === "?" || !globMagic.test(s[2])) && !globMagic.test(s[3]);
          const isDrive = /^[a-z]:/i.test(s[0]);
          if (isUNC) {
            return [...s.slice(0, 4), ...s.slice(4).map((ss) => this.parse(ss))];
          } else if (isDrive) {
            return [s[0], ...s.slice(1).map((ss) => this.parse(ss))];
          }
        }
        return s.map((ss) => this.parse(ss));
      });
      this.debug(this.pattern, set);
      this.set = set.filter((s) => s.indexOf(false) === -1);
      if (this.isWindows) {
        for (let i = 0;i < this.set.length; i++) {
          const p = this.set[i];
          if (p[0] === "" && p[1] === "" && this.globParts[i][2] === "?" && typeof p[3] === "string" && /^[a-z]:$/i.test(p[3])) {
            p[2] = "?";
          }
        }
      }
      this.debug(this.pattern, this.set);
    }
    preprocess(globParts) {
      if (this.options.noglobstar) {
        for (let i = 0;i < globParts.length; i++) {
          for (let j = 0;j < globParts[i].length; j++) {
            if (globParts[i][j] === "**") {
              globParts[i][j] = "*";
            }
          }
        }
      }
      const { optimizationLevel = 1 } = this.options;
      if (optimizationLevel >= 2) {
        globParts = this.firstPhasePreProcess(globParts);
        globParts = this.secondPhasePreProcess(globParts);
      } else if (optimizationLevel >= 1) {
        globParts = this.levelOneOptimize(globParts);
      } else {
        globParts = this.adjascentGlobstarOptimize(globParts);
      }
      return globParts;
    }
    adjascentGlobstarOptimize(globParts) {
      return globParts.map((parts) => {
        let gs = -1;
        while ((gs = parts.indexOf("**", gs + 1)) !== -1) {
          let i = gs;
          while (parts[i + 1] === "**") {
            i++;
          }
          if (i !== gs) {
            parts.splice(gs, i - gs);
          }
        }
        return parts;
      });
    }
    levelOneOptimize(globParts) {
      return globParts.map((parts) => {
        parts = parts.reduce((set, part) => {
          const prev = set[set.length - 1];
          if (part === "**" && prev === "**") {
            return set;
          }
          if (part === "..") {
            if (prev && prev !== ".." && prev !== "." && prev !== "**") {
              set.pop();
              return set;
            }
          }
          set.push(part);
          return set;
        }, []);
        return parts.length === 0 ? [""] : parts;
      });
    }
    levelTwoFileOptimize(parts) {
      if (!Array.isArray(parts)) {
        parts = this.slashSplit(parts);
      }
      let didSomething = false;
      do {
        didSomething = false;
        if (!this.preserveMultipleSlashes) {
          for (let i = 1;i < parts.length - 1; i++) {
            const p = parts[i];
            if (i === 1 && p === "" && parts[0] === "")
              continue;
            if (p === "." || p === "") {
              didSomething = true;
              parts.splice(i, 1);
              i--;
            }
          }
          if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
            didSomething = true;
            parts.pop();
          }
        }
        let dd = 0;
        while ((dd = parts.indexOf("..", dd + 1)) !== -1) {
          const p = parts[dd - 1];
          if (p && p !== "." && p !== ".." && p !== "**") {
            didSomething = true;
            parts.splice(dd - 1, 2);
            dd -= 2;
          }
        }
      } while (didSomething);
      return parts.length === 0 ? [""] : parts;
    }
    firstPhasePreProcess(globParts) {
      let didSomething = false;
      do {
        didSomething = false;
        for (let parts of globParts) {
          let gs = -1;
          while ((gs = parts.indexOf("**", gs + 1)) !== -1) {
            let gss = gs;
            while (parts[gss + 1] === "**") {
              gss++;
            }
            if (gss > gs) {
              parts.splice(gs + 1, gss - gs);
            }
            let next = parts[gs + 1];
            const p = parts[gs + 2];
            const p2 = parts[gs + 3];
            if (next !== "..")
              continue;
            if (!p || p === "." || p === ".." || !p2 || p2 === "." || p2 === "..") {
              continue;
            }
            didSomething = true;
            parts.splice(gs, 1);
            const other = parts.slice(0);
            other[gs] = "**";
            globParts.push(other);
            gs--;
          }
          if (!this.preserveMultipleSlashes) {
            for (let i = 1;i < parts.length - 1; i++) {
              const p = parts[i];
              if (i === 1 && p === "" && parts[0] === "")
                continue;
              if (p === "." || p === "") {
                didSomething = true;
                parts.splice(i, 1);
                i--;
              }
            }
            if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
              didSomething = true;
              parts.pop();
            }
          }
          let dd = 0;
          while ((dd = parts.indexOf("..", dd + 1)) !== -1) {
            const p = parts[dd - 1];
            if (p && p !== "." && p !== ".." && p !== "**") {
              didSomething = true;
              const needDot = dd === 1 && parts[dd + 1] === "**";
              const splin = needDot ? ["."] : [];
              parts.splice(dd - 1, 2, ...splin);
              if (parts.length === 0)
                parts.push("");
              dd -= 2;
            }
          }
        }
      } while (didSomething);
      return globParts;
    }
    secondPhasePreProcess(globParts) {
      for (let i = 0;i < globParts.length - 1; i++) {
        for (let j = i + 1;j < globParts.length; j++) {
          const matched = this.partsMatch(globParts[i], globParts[j], !this.preserveMultipleSlashes);
          if (matched) {
            globParts[i] = [];
            globParts[j] = matched;
            break;
          }
        }
      }
      return globParts.filter((gs) => gs.length);
    }
    partsMatch(a, b, emptyGSMatch = false) {
      let ai = 0;
      let bi = 0;
      let result = [];
      let which = "";
      while (ai < a.length && bi < b.length) {
        if (a[ai] === b[bi]) {
          result.push(which === "b" ? b[bi] : a[ai]);
          ai++;
          bi++;
        } else if (emptyGSMatch && a[ai] === "**" && b[bi] === a[ai + 1]) {
          result.push(a[ai]);
          ai++;
        } else if (emptyGSMatch && b[bi] === "**" && a[ai] === b[bi + 1]) {
          result.push(b[bi]);
          bi++;
        } else if (a[ai] === "*" && b[bi] && (this.options.dot || !b[bi].startsWith(".")) && b[bi] !== "**") {
          if (which === "b")
            return false;
          which = "a";
          result.push(a[ai]);
          ai++;
          bi++;
        } else if (b[bi] === "*" && a[ai] && (this.options.dot || !a[ai].startsWith(".")) && a[ai] !== "**") {
          if (which === "a")
            return false;
          which = "b";
          result.push(b[bi]);
          ai++;
          bi++;
        } else {
          return false;
        }
      }
      return a.length === b.length && result;
    }
    parseNegate() {
      if (this.nonegate)
        return;
      const pattern = this.pattern;
      let negate = false;
      let negateOffset = 0;
      for (let i = 0;i < pattern.length && pattern.charAt(i) === "!"; i++) {
        negate = !negate;
        negateOffset++;
      }
      if (negateOffset)
        this.pattern = pattern.slice(negateOffset);
      this.negate = negate;
    }
    matchOne(file, pattern, partial = false) {
      const options = this.options;
      if (this.isWindows) {
        const fileDrive = typeof file[0] === "string" && /^[a-z]:$/i.test(file[0]);
        const fileUNC = !fileDrive && file[0] === "" && file[1] === "" && file[2] === "?" && /^[a-z]:$/i.test(file[3]);
        const patternDrive = typeof pattern[0] === "string" && /^[a-z]:$/i.test(pattern[0]);
        const patternUNC = !patternDrive && pattern[0] === "" && pattern[1] === "" && pattern[2] === "?" && typeof pattern[3] === "string" && /^[a-z]:$/i.test(pattern[3]);
        const fdi = fileUNC ? 3 : fileDrive ? 0 : undefined;
        const pdi = patternUNC ? 3 : patternDrive ? 0 : undefined;
        if (typeof fdi === "number" && typeof pdi === "number") {
          const [fd, pd] = [file[fdi], pattern[pdi]];
          if (fd.toLowerCase() === pd.toLowerCase()) {
            pattern[pdi] = fd;
            if (pdi > fdi) {
              pattern = pattern.slice(pdi);
            } else if (fdi > pdi) {
              file = file.slice(fdi);
            }
          }
        }
      }
      const { optimizationLevel = 1 } = this.options;
      if (optimizationLevel >= 2) {
        file = this.levelTwoFileOptimize(file);
      }
      this.debug("matchOne", this, { file, pattern });
      this.debug("matchOne", file.length, pattern.length);
      for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length;fi < fl && pi < pl; fi++, pi++) {
        this.debug("matchOne loop");
        var p = pattern[pi];
        var f = file[fi];
        this.debug(pattern, p, f);
        if (p === false) {
          return false;
        }
        if (p === exports.GLOBSTAR) {
          this.debug("GLOBSTAR", [pattern, p, f]);
          var fr = fi;
          var pr = pi + 1;
          if (pr === pl) {
            this.debug("** at the end");
            for (;fi < fl; fi++) {
              if (file[fi] === "." || file[fi] === ".." || !options.dot && file[fi].charAt(0) === ".")
                return false;
            }
            return true;
          }
          while (fr < fl) {
            var swallowee = file[fr];
            this.debug(`
globstar while`, file, fr, pattern, pr, swallowee);
            if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
              this.debug("globstar found match!", fr, fl, swallowee);
              return true;
            } else {
              if (swallowee === "." || swallowee === ".." || !options.dot && swallowee.charAt(0) === ".") {
                this.debug("dot detected!", file, fr, pattern, pr);
                break;
              }
              this.debug("globstar swallow a segment, and continue");
              fr++;
            }
          }
          if (partial) {
            this.debug(`
>>> no match, partial?`, file, fr, pattern, pr);
            if (fr === fl) {
              return true;
            }
          }
          return false;
        }
        let hit;
        if (typeof p === "string") {
          hit = f === p;
          this.debug("string match", p, f, hit);
        } else {
          hit = p.test(f);
          this.debug("pattern match", p, f, hit);
        }
        if (!hit)
          return false;
      }
      if (fi === fl && pi === pl) {
        return true;
      } else if (fi === fl) {
        return partial;
      } else if (pi === pl) {
        return fi === fl - 1 && file[fi] === "";
      } else {
        throw new Error("wtf?");
      }
    }
    braceExpand() {
      return (0, exports.braceExpand)(this.pattern, this.options);
    }
    parse(pattern) {
      (0, assert_valid_pattern_js_1.assertValidPattern)(pattern);
      const options = this.options;
      if (pattern === "**")
        return exports.GLOBSTAR;
      if (pattern === "")
        return "";
      let m;
      let fastTest = null;
      if (m = pattern.match(starRE)) {
        fastTest = options.dot ? starTestDot : starTest;
      } else if (m = pattern.match(starDotExtRE)) {
        fastTest = (options.nocase ? options.dot ? starDotExtTestNocaseDot : starDotExtTestNocase : options.dot ? starDotExtTestDot : starDotExtTest)(m[1]);
      } else if (m = pattern.match(qmarksRE)) {
        fastTest = (options.nocase ? options.dot ? qmarksTestNocaseDot : qmarksTestNocase : options.dot ? qmarksTestDot : qmarksTest)(m);
      } else if (m = pattern.match(starDotStarRE)) {
        fastTest = options.dot ? starDotStarTestDot : starDotStarTest;
      } else if (m = pattern.match(dotStarRE)) {
        fastTest = dotStarTest;
      }
      const re = ast_js_1.AST.fromGlob(pattern, this.options).toMMPattern();
      if (fastTest && typeof re === "object") {
        Reflect.defineProperty(re, "test", { value: fastTest });
      }
      return re;
    }
    makeRe() {
      if (this.regexp || this.regexp === false)
        return this.regexp;
      const set = this.set;
      if (!set.length) {
        this.regexp = false;
        return this.regexp;
      }
      const options = this.options;
      const twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
      const flags = new Set(options.nocase ? ["i"] : []);
      let re = set.map((pattern) => {
        const pp = pattern.map((p) => {
          if (p instanceof RegExp) {
            for (const f of p.flags.split(""))
              flags.add(f);
          }
          return typeof p === "string" ? regExpEscape(p) : p === exports.GLOBSTAR ? exports.GLOBSTAR : p._src;
        });
        pp.forEach((p, i) => {
          const next = pp[i + 1];
          const prev = pp[i - 1];
          if (p !== exports.GLOBSTAR || prev === exports.GLOBSTAR) {
            return;
          }
          if (prev === undefined) {
            if (next !== undefined && next !== exports.GLOBSTAR) {
              pp[i + 1] = "(?:\\/|" + twoStar + "\\/)?" + next;
            } else {
              pp[i] = twoStar;
            }
          } else if (next === undefined) {
            pp[i - 1] = prev + "(?:\\/|" + twoStar + ")?";
          } else if (next !== exports.GLOBSTAR) {
            pp[i - 1] = prev + "(?:\\/|\\/" + twoStar + "\\/)" + next;
            pp[i + 1] = exports.GLOBSTAR;
          }
        });
        return pp.filter((p) => p !== exports.GLOBSTAR).join("/");
      }).join("|");
      const [open, close] = set.length > 1 ? ["(?:", ")"] : ["", ""];
      re = "^" + open + re + close + "$";
      if (this.negate)
        re = "^(?!" + re + ").+$";
      try {
        this.regexp = new RegExp(re, [...flags].join(""));
      } catch (ex) {
        this.regexp = false;
      }
      return this.regexp;
    }
    slashSplit(p) {
      if (this.preserveMultipleSlashes) {
        return p.split("/");
      } else if (this.isWindows && /^\/\/[^\/]+/.test(p)) {
        return ["", ...p.split(/\/+/)];
      } else {
        return p.split(/\/+/);
      }
    }
    match(f, partial = this.partial) {
      this.debug("match", f, this.pattern);
      if (this.comment) {
        return false;
      }
      if (this.empty) {
        return f === "";
      }
      if (f === "/" && partial) {
        return true;
      }
      const options = this.options;
      if (this.isWindows) {
        f = f.split("\\").join("/");
      }
      const ff = this.slashSplit(f);
      this.debug(this.pattern, "split", ff);
      const set = this.set;
      this.debug(this.pattern, "set", set);
      let filename = ff[ff.length - 1];
      if (!filename) {
        for (let i = ff.length - 2;!filename && i >= 0; i--) {
          filename = ff[i];
        }
      }
      for (let i = 0;i < set.length; i++) {
        const pattern = set[i];
        let file = ff;
        if (options.matchBase && pattern.length === 1) {
          file = [filename];
        }
        const hit = this.matchOne(file, pattern, partial);
        if (hit) {
          if (options.flipNegate) {
            return true;
          }
          return !this.negate;
        }
      }
      if (options.flipNegate) {
        return false;
      }
      return this.negate;
    }
    static defaults(def) {
      return exports.minimatch.defaults(def).Minimatch;
    }
  }
  exports.Minimatch = Minimatch;
  var ast_js_2 = require_ast();
  Object.defineProperty(exports, "AST", { enumerable: true, get: function() {
    return ast_js_2.AST;
  } });
  var escape_js_2 = require_escape();
  Object.defineProperty(exports, "escape", { enumerable: true, get: function() {
    return escape_js_2.escape;
  } });
  var unescape_js_2 = require_unescape();
  Object.defineProperty(exports, "unescape", { enumerable: true, get: function() {
    return unescape_js_2.unescape;
  } });
  exports.minimatch.AST = ast_js_1.AST;
  exports.minimatch.Minimatch = Minimatch;
  exports.minimatch.escape = escape_js_1.escape;
  exports.minimatch.unescape = unescape_js_1.unescape;
});

// ../../node_modules/.pnpm/lru-cache@10.4.3/node_modules/lru-cache/dist/commonjs/index.js
var require_commonjs2 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.LRUCache = undefined;
  var perf = typeof performance === "object" && performance && typeof performance.now === "function" ? performance : Date;
  var warned = new Set;
  var PROCESS = typeof process === "object" && !!process ? process : {};
  var emitWarning = (msg, type, code, fn) => {
    typeof PROCESS.emitWarning === "function" ? PROCESS.emitWarning(msg, type, code, fn) : console.error(`[${code}] ${type}: ${msg}`);
  };
  var AC = globalThis.AbortController;
  var AS = globalThis.AbortSignal;
  if (typeof AC === "undefined") {
    AS = class AbortSignal {
      onabort;
      _onabort = [];
      reason;
      aborted = false;
      addEventListener(_2, fn) {
        this._onabort.push(fn);
      }
    };
    AC = class AbortController {
      constructor() {
        warnACPolyfill();
      }
      signal = new AS;
      abort(reason) {
        if (this.signal.aborted)
          return;
        this.signal.reason = reason;
        this.signal.aborted = true;
        for (const fn of this.signal._onabort) {
          fn(reason);
        }
        this.signal.onabort?.(reason);
      }
    };
    let printACPolyfillWarning = PROCESS.env?.LRU_CACHE_IGNORE_AC_WARNING !== "1";
    const warnACPolyfill = () => {
      if (!printACPolyfillWarning)
        return;
      printACPolyfillWarning = false;
      emitWarning("AbortController is not defined. If using lru-cache in " + "node 14, load an AbortController polyfill from the " + "`node-abort-controller` package. A minimal polyfill is " + "provided for use by LRUCache.fetch(), but it should not be " + "relied upon in other contexts (eg, passing it to other APIs that " + "use AbortController/AbortSignal might have undesirable effects). " + "You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.", "NO_ABORT_CONTROLLER", "ENOTSUP", warnACPolyfill);
    };
  }
  var shouldWarn = (code) => !warned.has(code);
  var TYPE = Symbol("type");
  var isPosInt = (n) => n && n === Math.floor(n) && n > 0 && isFinite(n);
  var getUintArray = (max) => !isPosInt(max) ? null : max <= Math.pow(2, 8) ? Uint8Array : max <= Math.pow(2, 16) ? Uint16Array : max <= Math.pow(2, 32) ? Uint32Array : max <= Number.MAX_SAFE_INTEGER ? ZeroArray : null;

  class ZeroArray extends Array {
    constructor(size) {
      super(size);
      this.fill(0);
    }
  }

  class Stack {
    heap;
    length;
    static #constructing = false;
    static create(max) {
      const HeapCls = getUintArray(max);
      if (!HeapCls)
        return [];
      Stack.#constructing = true;
      const s = new Stack(max, HeapCls);
      Stack.#constructing = false;
      return s;
    }
    constructor(max, HeapCls) {
      if (!Stack.#constructing) {
        throw new TypeError("instantiate Stack using Stack.create(n)");
      }
      this.heap = new HeapCls(max);
      this.length = 0;
    }
    push(n) {
      this.heap[this.length++] = n;
    }
    pop() {
      return this.heap[--this.length];
    }
  }

  class LRUCache {
    #max;
    #maxSize;
    #dispose;
    #disposeAfter;
    #fetchMethod;
    #memoMethod;
    ttl;
    ttlResolution;
    ttlAutopurge;
    updateAgeOnGet;
    updateAgeOnHas;
    allowStale;
    noDisposeOnSet;
    noUpdateTTL;
    maxEntrySize;
    sizeCalculation;
    noDeleteOnFetchRejection;
    noDeleteOnStaleGet;
    allowStaleOnFetchAbort;
    allowStaleOnFetchRejection;
    ignoreFetchAbort;
    #size;
    #calculatedSize;
    #keyMap;
    #keyList;
    #valList;
    #next;
    #prev;
    #head;
    #tail;
    #free;
    #disposed;
    #sizes;
    #starts;
    #ttls;
    #hasDispose;
    #hasFetchMethod;
    #hasDisposeAfter;
    static unsafeExposeInternals(c) {
      return {
        starts: c.#starts,
        ttls: c.#ttls,
        sizes: c.#sizes,
        keyMap: c.#keyMap,
        keyList: c.#keyList,
        valList: c.#valList,
        next: c.#next,
        prev: c.#prev,
        get head() {
          return c.#head;
        },
        get tail() {
          return c.#tail;
        },
        free: c.#free,
        isBackgroundFetch: (p) => c.#isBackgroundFetch(p),
        backgroundFetch: (k, index, options, context) => c.#backgroundFetch(k, index, options, context),
        moveToTail: (index) => c.#moveToTail(index),
        indexes: (options) => c.#indexes(options),
        rindexes: (options) => c.#rindexes(options),
        isStale: (index) => c.#isStale(index)
      };
    }
    get max() {
      return this.#max;
    }
    get maxSize() {
      return this.#maxSize;
    }
    get calculatedSize() {
      return this.#calculatedSize;
    }
    get size() {
      return this.#size;
    }
    get fetchMethod() {
      return this.#fetchMethod;
    }
    get memoMethod() {
      return this.#memoMethod;
    }
    get dispose() {
      return this.#dispose;
    }
    get disposeAfter() {
      return this.#disposeAfter;
    }
    constructor(options) {
      const { max = 0, ttl, ttlResolution = 1, ttlAutopurge, updateAgeOnGet, updateAgeOnHas, allowStale, dispose, disposeAfter, noDisposeOnSet, noUpdateTTL, maxSize = 0, maxEntrySize = 0, sizeCalculation, fetchMethod, memoMethod, noDeleteOnFetchRejection, noDeleteOnStaleGet, allowStaleOnFetchRejection, allowStaleOnFetchAbort, ignoreFetchAbort } = options;
      if (max !== 0 && !isPosInt(max)) {
        throw new TypeError("max option must be a nonnegative integer");
      }
      const UintArray = max ? getUintArray(max) : Array;
      if (!UintArray) {
        throw new Error("invalid max value: " + max);
      }
      this.#max = max;
      this.#maxSize = maxSize;
      this.maxEntrySize = maxEntrySize || this.#maxSize;
      this.sizeCalculation = sizeCalculation;
      if (this.sizeCalculation) {
        if (!this.#maxSize && !this.maxEntrySize) {
          throw new TypeError("cannot set sizeCalculation without setting maxSize or maxEntrySize");
        }
        if (typeof this.sizeCalculation !== "function") {
          throw new TypeError("sizeCalculation set to non-function");
        }
      }
      if (memoMethod !== undefined && typeof memoMethod !== "function") {
        throw new TypeError("memoMethod must be a function if defined");
      }
      this.#memoMethod = memoMethod;
      if (fetchMethod !== undefined && typeof fetchMethod !== "function") {
        throw new TypeError("fetchMethod must be a function if specified");
      }
      this.#fetchMethod = fetchMethod;
      this.#hasFetchMethod = !!fetchMethod;
      this.#keyMap = new Map;
      this.#keyList = new Array(max).fill(undefined);
      this.#valList = new Array(max).fill(undefined);
      this.#next = new UintArray(max);
      this.#prev = new UintArray(max);
      this.#head = 0;
      this.#tail = 0;
      this.#free = Stack.create(max);
      this.#size = 0;
      this.#calculatedSize = 0;
      if (typeof dispose === "function") {
        this.#dispose = dispose;
      }
      if (typeof disposeAfter === "function") {
        this.#disposeAfter = disposeAfter;
        this.#disposed = [];
      } else {
        this.#disposeAfter = undefined;
        this.#disposed = undefined;
      }
      this.#hasDispose = !!this.#dispose;
      this.#hasDisposeAfter = !!this.#disposeAfter;
      this.noDisposeOnSet = !!noDisposeOnSet;
      this.noUpdateTTL = !!noUpdateTTL;
      this.noDeleteOnFetchRejection = !!noDeleteOnFetchRejection;
      this.allowStaleOnFetchRejection = !!allowStaleOnFetchRejection;
      this.allowStaleOnFetchAbort = !!allowStaleOnFetchAbort;
      this.ignoreFetchAbort = !!ignoreFetchAbort;
      if (this.maxEntrySize !== 0) {
        if (this.#maxSize !== 0) {
          if (!isPosInt(this.#maxSize)) {
            throw new TypeError("maxSize must be a positive integer if specified");
          }
        }
        if (!isPosInt(this.maxEntrySize)) {
          throw new TypeError("maxEntrySize must be a positive integer if specified");
        }
        this.#initializeSizeTracking();
      }
      this.allowStale = !!allowStale;
      this.noDeleteOnStaleGet = !!noDeleteOnStaleGet;
      this.updateAgeOnGet = !!updateAgeOnGet;
      this.updateAgeOnHas = !!updateAgeOnHas;
      this.ttlResolution = isPosInt(ttlResolution) || ttlResolution === 0 ? ttlResolution : 1;
      this.ttlAutopurge = !!ttlAutopurge;
      this.ttl = ttl || 0;
      if (this.ttl) {
        if (!isPosInt(this.ttl)) {
          throw new TypeError("ttl must be a positive integer if specified");
        }
        this.#initializeTTLTracking();
      }
      if (this.#max === 0 && this.ttl === 0 && this.#maxSize === 0) {
        throw new TypeError("At least one of max, maxSize, or ttl is required");
      }
      if (!this.ttlAutopurge && !this.#max && !this.#maxSize) {
        const code = "LRU_CACHE_UNBOUNDED";
        if (shouldWarn(code)) {
          warned.add(code);
          const msg = "TTL caching without ttlAutopurge, max, or maxSize can " + "result in unbounded memory consumption.";
          emitWarning(msg, "UnboundedCacheWarning", code, LRUCache);
        }
      }
    }
    getRemainingTTL(key) {
      return this.#keyMap.has(key) ? Infinity : 0;
    }
    #initializeTTLTracking() {
      const ttls = new ZeroArray(this.#max);
      const starts = new ZeroArray(this.#max);
      this.#ttls = ttls;
      this.#starts = starts;
      this.#setItemTTL = (index, ttl, start = perf.now()) => {
        starts[index] = ttl !== 0 ? start : 0;
        ttls[index] = ttl;
        if (ttl !== 0 && this.ttlAutopurge) {
          const t = setTimeout(() => {
            if (this.#isStale(index)) {
              this.#delete(this.#keyList[index], "expire");
            }
          }, ttl + 1);
          if (t.unref) {
            t.unref();
          }
        }
      };
      this.#updateItemAge = (index) => {
        starts[index] = ttls[index] !== 0 ? perf.now() : 0;
      };
      this.#statusTTL = (status, index) => {
        if (ttls[index]) {
          const ttl = ttls[index];
          const start = starts[index];
          if (!ttl || !start)
            return;
          status.ttl = ttl;
          status.start = start;
          status.now = cachedNow || getNow();
          const age = status.now - start;
          status.remainingTTL = ttl - age;
        }
      };
      let cachedNow = 0;
      const getNow = () => {
        const n = perf.now();
        if (this.ttlResolution > 0) {
          cachedNow = n;
          const t = setTimeout(() => cachedNow = 0, this.ttlResolution);
          if (t.unref) {
            t.unref();
          }
        }
        return n;
      };
      this.getRemainingTTL = (key) => {
        const index = this.#keyMap.get(key);
        if (index === undefined) {
          return 0;
        }
        const ttl = ttls[index];
        const start = starts[index];
        if (!ttl || !start) {
          return Infinity;
        }
        const age = (cachedNow || getNow()) - start;
        return ttl - age;
      };
      this.#isStale = (index) => {
        const s = starts[index];
        const t = ttls[index];
        return !!t && !!s && (cachedNow || getNow()) - s > t;
      };
    }
    #updateItemAge = () => {};
    #statusTTL = () => {};
    #setItemTTL = () => {};
    #isStale = () => false;
    #initializeSizeTracking() {
      const sizes = new ZeroArray(this.#max);
      this.#calculatedSize = 0;
      this.#sizes = sizes;
      this.#removeItemSize = (index) => {
        this.#calculatedSize -= sizes[index];
        sizes[index] = 0;
      };
      this.#requireSize = (k, v, size, sizeCalculation) => {
        if (this.#isBackgroundFetch(v)) {
          return 0;
        }
        if (!isPosInt(size)) {
          if (sizeCalculation) {
            if (typeof sizeCalculation !== "function") {
              throw new TypeError("sizeCalculation must be a function");
            }
            size = sizeCalculation(v, k);
            if (!isPosInt(size)) {
              throw new TypeError("sizeCalculation return invalid (expect positive integer)");
            }
          } else {
            throw new TypeError("invalid size value (must be positive integer). " + "When maxSize or maxEntrySize is used, sizeCalculation " + "or size must be set.");
          }
        }
        return size;
      };
      this.#addItemSize = (index, size, status) => {
        sizes[index] = size;
        if (this.#maxSize) {
          const maxSize = this.#maxSize - sizes[index];
          while (this.#calculatedSize > maxSize) {
            this.#evict(true);
          }
        }
        this.#calculatedSize += sizes[index];
        if (status) {
          status.entrySize = size;
          status.totalCalculatedSize = this.#calculatedSize;
        }
      };
    }
    #removeItemSize = (_i) => {};
    #addItemSize = (_i, _s, _st) => {};
    #requireSize = (_k, _v, size, sizeCalculation) => {
      if (size || sizeCalculation) {
        throw new TypeError("cannot set size without setting maxSize or maxEntrySize on cache");
      }
      return 0;
    };
    *#indexes({ allowStale = this.allowStale } = {}) {
      if (this.#size) {
        for (let i = this.#tail;; ) {
          if (!this.#isValidIndex(i)) {
            break;
          }
          if (allowStale || !this.#isStale(i)) {
            yield i;
          }
          if (i === this.#head) {
            break;
          } else {
            i = this.#prev[i];
          }
        }
      }
    }
    *#rindexes({ allowStale = this.allowStale } = {}) {
      if (this.#size) {
        for (let i = this.#head;; ) {
          if (!this.#isValidIndex(i)) {
            break;
          }
          if (allowStale || !this.#isStale(i)) {
            yield i;
          }
          if (i === this.#tail) {
            break;
          } else {
            i = this.#next[i];
          }
        }
      }
    }
    #isValidIndex(index) {
      return index !== undefined && this.#keyMap.get(this.#keyList[index]) === index;
    }
    *entries() {
      for (const i of this.#indexes()) {
        if (this.#valList[i] !== undefined && this.#keyList[i] !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
          yield [this.#keyList[i], this.#valList[i]];
        }
      }
    }
    *rentries() {
      for (const i of this.#rindexes()) {
        if (this.#valList[i] !== undefined && this.#keyList[i] !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
          yield [this.#keyList[i], this.#valList[i]];
        }
      }
    }
    *keys() {
      for (const i of this.#indexes()) {
        const k = this.#keyList[i];
        if (k !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
          yield k;
        }
      }
    }
    *rkeys() {
      for (const i of this.#rindexes()) {
        const k = this.#keyList[i];
        if (k !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
          yield k;
        }
      }
    }
    *values() {
      for (const i of this.#indexes()) {
        const v = this.#valList[i];
        if (v !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
          yield this.#valList[i];
        }
      }
    }
    *rvalues() {
      for (const i of this.#rindexes()) {
        const v = this.#valList[i];
        if (v !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
          yield this.#valList[i];
        }
      }
    }
    [Symbol.iterator]() {
      return this.entries();
    }
    [Symbol.toStringTag] = "LRUCache";
    find(fn, getOptions = {}) {
      for (const i of this.#indexes()) {
        const v = this.#valList[i];
        const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        if (value === undefined)
          continue;
        if (fn(value, this.#keyList[i], this)) {
          return this.get(this.#keyList[i], getOptions);
        }
      }
    }
    forEach(fn, thisp = this) {
      for (const i of this.#indexes()) {
        const v = this.#valList[i];
        const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        if (value === undefined)
          continue;
        fn.call(thisp, value, this.#keyList[i], this);
      }
    }
    rforEach(fn, thisp = this) {
      for (const i of this.#rindexes()) {
        const v = this.#valList[i];
        const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        if (value === undefined)
          continue;
        fn.call(thisp, value, this.#keyList[i], this);
      }
    }
    purgeStale() {
      let deleted = false;
      for (const i of this.#rindexes({ allowStale: true })) {
        if (this.#isStale(i)) {
          this.#delete(this.#keyList[i], "expire");
          deleted = true;
        }
      }
      return deleted;
    }
    info(key) {
      const i = this.#keyMap.get(key);
      if (i === undefined)
        return;
      const v = this.#valList[i];
      const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
      if (value === undefined)
        return;
      const entry = { value };
      if (this.#ttls && this.#starts) {
        const ttl = this.#ttls[i];
        const start = this.#starts[i];
        if (ttl && start) {
          const remain = ttl - (perf.now() - start);
          entry.ttl = remain;
          entry.start = Date.now();
        }
      }
      if (this.#sizes) {
        entry.size = this.#sizes[i];
      }
      return entry;
    }
    dump() {
      const arr = [];
      for (const i of this.#indexes({ allowStale: true })) {
        const key = this.#keyList[i];
        const v = this.#valList[i];
        const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        if (value === undefined || key === undefined)
          continue;
        const entry = { value };
        if (this.#ttls && this.#starts) {
          entry.ttl = this.#ttls[i];
          const age = perf.now() - this.#starts[i];
          entry.start = Math.floor(Date.now() - age);
        }
        if (this.#sizes) {
          entry.size = this.#sizes[i];
        }
        arr.unshift([key, entry]);
      }
      return arr;
    }
    load(arr) {
      this.clear();
      for (const [key, entry] of arr) {
        if (entry.start) {
          const age = Date.now() - entry.start;
          entry.start = perf.now() - age;
        }
        this.set(key, entry.value, entry);
      }
    }
    set(k, v, setOptions = {}) {
      if (v === undefined) {
        this.delete(k);
        return this;
      }
      const { ttl = this.ttl, start, noDisposeOnSet = this.noDisposeOnSet, sizeCalculation = this.sizeCalculation, status } = setOptions;
      let { noUpdateTTL = this.noUpdateTTL } = setOptions;
      const size = this.#requireSize(k, v, setOptions.size || 0, sizeCalculation);
      if (this.maxEntrySize && size > this.maxEntrySize) {
        if (status) {
          status.set = "miss";
          status.maxEntrySizeExceeded = true;
        }
        this.#delete(k, "set");
        return this;
      }
      let index = this.#size === 0 ? undefined : this.#keyMap.get(k);
      if (index === undefined) {
        index = this.#size === 0 ? this.#tail : this.#free.length !== 0 ? this.#free.pop() : this.#size === this.#max ? this.#evict(false) : this.#size;
        this.#keyList[index] = k;
        this.#valList[index] = v;
        this.#keyMap.set(k, index);
        this.#next[this.#tail] = index;
        this.#prev[index] = this.#tail;
        this.#tail = index;
        this.#size++;
        this.#addItemSize(index, size, status);
        if (status)
          status.set = "add";
        noUpdateTTL = false;
      } else {
        this.#moveToTail(index);
        const oldVal = this.#valList[index];
        if (v !== oldVal) {
          if (this.#hasFetchMethod && this.#isBackgroundFetch(oldVal)) {
            oldVal.__abortController.abort(new Error("replaced"));
            const { __staleWhileFetching: s } = oldVal;
            if (s !== undefined && !noDisposeOnSet) {
              if (this.#hasDispose) {
                this.#dispose?.(s, k, "set");
              }
              if (this.#hasDisposeAfter) {
                this.#disposed?.push([s, k, "set"]);
              }
            }
          } else if (!noDisposeOnSet) {
            if (this.#hasDispose) {
              this.#dispose?.(oldVal, k, "set");
            }
            if (this.#hasDisposeAfter) {
              this.#disposed?.push([oldVal, k, "set"]);
            }
          }
          this.#removeItemSize(index);
          this.#addItemSize(index, size, status);
          this.#valList[index] = v;
          if (status) {
            status.set = "replace";
            const oldValue = oldVal && this.#isBackgroundFetch(oldVal) ? oldVal.__staleWhileFetching : oldVal;
            if (oldValue !== undefined)
              status.oldValue = oldValue;
          }
        } else if (status) {
          status.set = "update";
        }
      }
      if (ttl !== 0 && !this.#ttls) {
        this.#initializeTTLTracking();
      }
      if (this.#ttls) {
        if (!noUpdateTTL) {
          this.#setItemTTL(index, ttl, start);
        }
        if (status)
          this.#statusTTL(status, index);
      }
      if (!noDisposeOnSet && this.#hasDisposeAfter && this.#disposed) {
        const dt = this.#disposed;
        let task;
        while (task = dt?.shift()) {
          this.#disposeAfter?.(...task);
        }
      }
      return this;
    }
    pop() {
      try {
        while (this.#size) {
          const val = this.#valList[this.#head];
          this.#evict(true);
          if (this.#isBackgroundFetch(val)) {
            if (val.__staleWhileFetching) {
              return val.__staleWhileFetching;
            }
          } else if (val !== undefined) {
            return val;
          }
        }
      } finally {
        if (this.#hasDisposeAfter && this.#disposed) {
          const dt = this.#disposed;
          let task;
          while (task = dt?.shift()) {
            this.#disposeAfter?.(...task);
          }
        }
      }
    }
    #evict(free) {
      const head = this.#head;
      const k = this.#keyList[head];
      const v = this.#valList[head];
      if (this.#hasFetchMethod && this.#isBackgroundFetch(v)) {
        v.__abortController.abort(new Error("evicted"));
      } else if (this.#hasDispose || this.#hasDisposeAfter) {
        if (this.#hasDispose) {
          this.#dispose?.(v, k, "evict");
        }
        if (this.#hasDisposeAfter) {
          this.#disposed?.push([v, k, "evict"]);
        }
      }
      this.#removeItemSize(head);
      if (free) {
        this.#keyList[head] = undefined;
        this.#valList[head] = undefined;
        this.#free.push(head);
      }
      if (this.#size === 1) {
        this.#head = this.#tail = 0;
        this.#free.length = 0;
      } else {
        this.#head = this.#next[head];
      }
      this.#keyMap.delete(k);
      this.#size--;
      return head;
    }
    has(k, hasOptions = {}) {
      const { updateAgeOnHas = this.updateAgeOnHas, status } = hasOptions;
      const index = this.#keyMap.get(k);
      if (index !== undefined) {
        const v = this.#valList[index];
        if (this.#isBackgroundFetch(v) && v.__staleWhileFetching === undefined) {
          return false;
        }
        if (!this.#isStale(index)) {
          if (updateAgeOnHas) {
            this.#updateItemAge(index);
          }
          if (status) {
            status.has = "hit";
            this.#statusTTL(status, index);
          }
          return true;
        } else if (status) {
          status.has = "stale";
          this.#statusTTL(status, index);
        }
      } else if (status) {
        status.has = "miss";
      }
      return false;
    }
    peek(k, peekOptions = {}) {
      const { allowStale = this.allowStale } = peekOptions;
      const index = this.#keyMap.get(k);
      if (index === undefined || !allowStale && this.#isStale(index)) {
        return;
      }
      const v = this.#valList[index];
      return this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
    }
    #backgroundFetch(k, index, options, context) {
      const v = index === undefined ? undefined : this.#valList[index];
      if (this.#isBackgroundFetch(v)) {
        return v;
      }
      const ac = new AC;
      const { signal } = options;
      signal?.addEventListener("abort", () => ac.abort(signal.reason), {
        signal: ac.signal
      });
      const fetchOpts = {
        signal: ac.signal,
        options,
        context
      };
      const cb = (v2, updateCache = false) => {
        const { aborted } = ac.signal;
        const ignoreAbort = options.ignoreFetchAbort && v2 !== undefined;
        if (options.status) {
          if (aborted && !updateCache) {
            options.status.fetchAborted = true;
            options.status.fetchError = ac.signal.reason;
            if (ignoreAbort)
              options.status.fetchAbortIgnored = true;
          } else {
            options.status.fetchResolved = true;
          }
        }
        if (aborted && !ignoreAbort && !updateCache) {
          return fetchFail(ac.signal.reason);
        }
        const bf2 = p;
        if (this.#valList[index] === p) {
          if (v2 === undefined) {
            if (bf2.__staleWhileFetching) {
              this.#valList[index] = bf2.__staleWhileFetching;
            } else {
              this.#delete(k, "fetch");
            }
          } else {
            if (options.status)
              options.status.fetchUpdated = true;
            this.set(k, v2, fetchOpts.options);
          }
        }
        return v2;
      };
      const eb = (er) => {
        if (options.status) {
          options.status.fetchRejected = true;
          options.status.fetchError = er;
        }
        return fetchFail(er);
      };
      const fetchFail = (er) => {
        const { aborted } = ac.signal;
        const allowStaleAborted = aborted && options.allowStaleOnFetchAbort;
        const allowStale = allowStaleAborted || options.allowStaleOnFetchRejection;
        const noDelete = allowStale || options.noDeleteOnFetchRejection;
        const bf2 = p;
        if (this.#valList[index] === p) {
          const del = !noDelete || bf2.__staleWhileFetching === undefined;
          if (del) {
            this.#delete(k, "fetch");
          } else if (!allowStaleAborted) {
            this.#valList[index] = bf2.__staleWhileFetching;
          }
        }
        if (allowStale) {
          if (options.status && bf2.__staleWhileFetching !== undefined) {
            options.status.returnedStale = true;
          }
          return bf2.__staleWhileFetching;
        } else if (bf2.__returned === bf2) {
          throw er;
        }
      };
      const pcall = (res, rej) => {
        const fmp = this.#fetchMethod?.(k, v, fetchOpts);
        if (fmp && fmp instanceof Promise) {
          fmp.then((v2) => res(v2 === undefined ? undefined : v2), rej);
        }
        ac.signal.addEventListener("abort", () => {
          if (!options.ignoreFetchAbort || options.allowStaleOnFetchAbort) {
            res(undefined);
            if (options.allowStaleOnFetchAbort) {
              res = (v2) => cb(v2, true);
            }
          }
        });
      };
      if (options.status)
        options.status.fetchDispatched = true;
      const p = new Promise(pcall).then(cb, eb);
      const bf = Object.assign(p, {
        __abortController: ac,
        __staleWhileFetching: v,
        __returned: undefined
      });
      if (index === undefined) {
        this.set(k, bf, { ...fetchOpts.options, status: undefined });
        index = this.#keyMap.get(k);
      } else {
        this.#valList[index] = bf;
      }
      return bf;
    }
    #isBackgroundFetch(p) {
      if (!this.#hasFetchMethod)
        return false;
      const b = p;
      return !!b && b instanceof Promise && b.hasOwnProperty("__staleWhileFetching") && b.__abortController instanceof AC;
    }
    async fetch(k, fetchOptions = {}) {
      const {
        allowStale = this.allowStale,
        updateAgeOnGet = this.updateAgeOnGet,
        noDeleteOnStaleGet = this.noDeleteOnStaleGet,
        ttl = this.ttl,
        noDisposeOnSet = this.noDisposeOnSet,
        size = 0,
        sizeCalculation = this.sizeCalculation,
        noUpdateTTL = this.noUpdateTTL,
        noDeleteOnFetchRejection = this.noDeleteOnFetchRejection,
        allowStaleOnFetchRejection = this.allowStaleOnFetchRejection,
        ignoreFetchAbort = this.ignoreFetchAbort,
        allowStaleOnFetchAbort = this.allowStaleOnFetchAbort,
        context,
        forceRefresh = false,
        status,
        signal
      } = fetchOptions;
      if (!this.#hasFetchMethod) {
        if (status)
          status.fetch = "get";
        return this.get(k, {
          allowStale,
          updateAgeOnGet,
          noDeleteOnStaleGet,
          status
        });
      }
      const options = {
        allowStale,
        updateAgeOnGet,
        noDeleteOnStaleGet,
        ttl,
        noDisposeOnSet,
        size,
        sizeCalculation,
        noUpdateTTL,
        noDeleteOnFetchRejection,
        allowStaleOnFetchRejection,
        allowStaleOnFetchAbort,
        ignoreFetchAbort,
        status,
        signal
      };
      let index = this.#keyMap.get(k);
      if (index === undefined) {
        if (status)
          status.fetch = "miss";
        const p = this.#backgroundFetch(k, index, options, context);
        return p.__returned = p;
      } else {
        const v = this.#valList[index];
        if (this.#isBackgroundFetch(v)) {
          const stale = allowStale && v.__staleWhileFetching !== undefined;
          if (status) {
            status.fetch = "inflight";
            if (stale)
              status.returnedStale = true;
          }
          return stale ? v.__staleWhileFetching : v.__returned = v;
        }
        const isStale = this.#isStale(index);
        if (!forceRefresh && !isStale) {
          if (status)
            status.fetch = "hit";
          this.#moveToTail(index);
          if (updateAgeOnGet) {
            this.#updateItemAge(index);
          }
          if (status)
            this.#statusTTL(status, index);
          return v;
        }
        const p = this.#backgroundFetch(k, index, options, context);
        const hasStale = p.__staleWhileFetching !== undefined;
        const staleVal = hasStale && allowStale;
        if (status) {
          status.fetch = isStale ? "stale" : "refresh";
          if (staleVal && isStale)
            status.returnedStale = true;
        }
        return staleVal ? p.__staleWhileFetching : p.__returned = p;
      }
    }
    async forceFetch(k, fetchOptions = {}) {
      const v = await this.fetch(k, fetchOptions);
      if (v === undefined)
        throw new Error("fetch() returned undefined");
      return v;
    }
    memo(k, memoOptions = {}) {
      const memoMethod = this.#memoMethod;
      if (!memoMethod) {
        throw new Error("no memoMethod provided to constructor");
      }
      const { context, forceRefresh, ...options } = memoOptions;
      const v = this.get(k, options);
      if (!forceRefresh && v !== undefined)
        return v;
      const vv = memoMethod(k, v, {
        options,
        context
      });
      this.set(k, vv, options);
      return vv;
    }
    get(k, getOptions = {}) {
      const { allowStale = this.allowStale, updateAgeOnGet = this.updateAgeOnGet, noDeleteOnStaleGet = this.noDeleteOnStaleGet, status } = getOptions;
      const index = this.#keyMap.get(k);
      if (index !== undefined) {
        const value = this.#valList[index];
        const fetching = this.#isBackgroundFetch(value);
        if (status)
          this.#statusTTL(status, index);
        if (this.#isStale(index)) {
          if (status)
            status.get = "stale";
          if (!fetching) {
            if (!noDeleteOnStaleGet) {
              this.#delete(k, "expire");
            }
            if (status && allowStale)
              status.returnedStale = true;
            return allowStale ? value : undefined;
          } else {
            if (status && allowStale && value.__staleWhileFetching !== undefined) {
              status.returnedStale = true;
            }
            return allowStale ? value.__staleWhileFetching : undefined;
          }
        } else {
          if (status)
            status.get = "hit";
          if (fetching) {
            return value.__staleWhileFetching;
          }
          this.#moveToTail(index);
          if (updateAgeOnGet) {
            this.#updateItemAge(index);
          }
          return value;
        }
      } else if (status) {
        status.get = "miss";
      }
    }
    #connect(p, n) {
      this.#prev[n] = p;
      this.#next[p] = n;
    }
    #moveToTail(index) {
      if (index !== this.#tail) {
        if (index === this.#head) {
          this.#head = this.#next[index];
        } else {
          this.#connect(this.#prev[index], this.#next[index]);
        }
        this.#connect(this.#tail, index);
        this.#tail = index;
      }
    }
    delete(k) {
      return this.#delete(k, "delete");
    }
    #delete(k, reason) {
      let deleted = false;
      if (this.#size !== 0) {
        const index = this.#keyMap.get(k);
        if (index !== undefined) {
          deleted = true;
          if (this.#size === 1) {
            this.#clear(reason);
          } else {
            this.#removeItemSize(index);
            const v = this.#valList[index];
            if (this.#isBackgroundFetch(v)) {
              v.__abortController.abort(new Error("deleted"));
            } else if (this.#hasDispose || this.#hasDisposeAfter) {
              if (this.#hasDispose) {
                this.#dispose?.(v, k, reason);
              }
              if (this.#hasDisposeAfter) {
                this.#disposed?.push([v, k, reason]);
              }
            }
            this.#keyMap.delete(k);
            this.#keyList[index] = undefined;
            this.#valList[index] = undefined;
            if (index === this.#tail) {
              this.#tail = this.#prev[index];
            } else if (index === this.#head) {
              this.#head = this.#next[index];
            } else {
              const pi = this.#prev[index];
              this.#next[pi] = this.#next[index];
              const ni = this.#next[index];
              this.#prev[ni] = this.#prev[index];
            }
            this.#size--;
            this.#free.push(index);
          }
        }
      }
      if (this.#hasDisposeAfter && this.#disposed?.length) {
        const dt = this.#disposed;
        let task;
        while (task = dt?.shift()) {
          this.#disposeAfter?.(...task);
        }
      }
      return deleted;
    }
    clear() {
      return this.#clear("delete");
    }
    #clear(reason) {
      for (const index of this.#rindexes({ allowStale: true })) {
        const v = this.#valList[index];
        if (this.#isBackgroundFetch(v)) {
          v.__abortController.abort(new Error("deleted"));
        } else {
          const k = this.#keyList[index];
          if (this.#hasDispose) {
            this.#dispose?.(v, k, reason);
          }
          if (this.#hasDisposeAfter) {
            this.#disposed?.push([v, k, reason]);
          }
        }
      }
      this.#keyMap.clear();
      this.#valList.fill(undefined);
      this.#keyList.fill(undefined);
      if (this.#ttls && this.#starts) {
        this.#ttls.fill(0);
        this.#starts.fill(0);
      }
      if (this.#sizes) {
        this.#sizes.fill(0);
      }
      this.#head = 0;
      this.#tail = 0;
      this.#free.length = 0;
      this.#calculatedSize = 0;
      this.#size = 0;
      if (this.#hasDisposeAfter && this.#disposed) {
        const dt = this.#disposed;
        let task;
        while (task = dt?.shift()) {
          this.#disposeAfter?.(...task);
        }
      }
    }
  }
  exports.LRUCache = LRUCache;
});

// ../../node_modules/.pnpm/minipass@7.1.2/node_modules/minipass/dist/commonjs/index.js
var require_commonjs3 = __commonJS((exports) => {
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Minipass = exports.isWritable = exports.isReadable = exports.isStream = undefined;
  var proc = typeof process === "object" && process ? process : {
    stdout: null,
    stderr: null
  };
  var node_events_1 = __require("node:events");
  var node_stream_1 = __importDefault(__require("node:stream"));
  var node_string_decoder_1 = __require("node:string_decoder");
  var isStream = (s) => !!s && typeof s === "object" && (s instanceof Minipass || s instanceof node_stream_1.default || (0, exports.isReadable)(s) || (0, exports.isWritable)(s));
  exports.isStream = isStream;
  var isReadable = (s) => !!s && typeof s === "object" && s instanceof node_events_1.EventEmitter && typeof s.pipe === "function" && s.pipe !== node_stream_1.default.Writable.prototype.pipe;
  exports.isReadable = isReadable;
  var isWritable = (s) => !!s && typeof s === "object" && s instanceof node_events_1.EventEmitter && typeof s.write === "function" && typeof s.end === "function";
  exports.isWritable = isWritable;
  var EOF = Symbol("EOF");
  var MAYBE_EMIT_END = Symbol("maybeEmitEnd");
  var EMITTED_END = Symbol("emittedEnd");
  var EMITTING_END = Symbol("emittingEnd");
  var EMITTED_ERROR = Symbol("emittedError");
  var CLOSED = Symbol("closed");
  var READ = Symbol("read");
  var FLUSH = Symbol("flush");
  var FLUSHCHUNK = Symbol("flushChunk");
  var ENCODING = Symbol("encoding");
  var DECODER = Symbol("decoder");
  var FLOWING = Symbol("flowing");
  var PAUSED = Symbol("paused");
  var RESUME = Symbol("resume");
  var BUFFER = Symbol("buffer");
  var PIPES = Symbol("pipes");
  var BUFFERLENGTH = Symbol("bufferLength");
  var BUFFERPUSH = Symbol("bufferPush");
  var BUFFERSHIFT = Symbol("bufferShift");
  var OBJECTMODE = Symbol("objectMode");
  var DESTROYED = Symbol("destroyed");
  var ERROR = Symbol("error");
  var EMITDATA = Symbol("emitData");
  var EMITEND = Symbol("emitEnd");
  var EMITEND2 = Symbol("emitEnd2");
  var ASYNC = Symbol("async");
  var ABORT = Symbol("abort");
  var ABORTED = Symbol("aborted");
  var SIGNAL = Symbol("signal");
  var DATALISTENERS = Symbol("dataListeners");
  var DISCARDED = Symbol("discarded");
  var defer = (fn) => Promise.resolve().then(fn);
  var nodefer = (fn) => fn();
  var isEndish = (ev) => ev === "end" || ev === "finish" || ev === "prefinish";
  var isArrayBufferLike = (b) => b instanceof ArrayBuffer || !!b && typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
  var isArrayBufferView = (b) => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);

  class Pipe {
    src;
    dest;
    opts;
    ondrain;
    constructor(src, dest, opts) {
      this.src = src;
      this.dest = dest;
      this.opts = opts;
      this.ondrain = () => src[RESUME]();
      this.dest.on("drain", this.ondrain);
    }
    unpipe() {
      this.dest.removeListener("drain", this.ondrain);
    }
    proxyErrors(_er) {}
    end() {
      this.unpipe();
      if (this.opts.end)
        this.dest.end();
    }
  }

  class PipeProxyErrors extends Pipe {
    unpipe() {
      this.src.removeListener("error", this.proxyErrors);
      super.unpipe();
    }
    constructor(src, dest, opts) {
      super(src, dest, opts);
      this.proxyErrors = (er) => dest.emit("error", er);
      src.on("error", this.proxyErrors);
    }
  }
  var isObjectModeOptions = (o) => !!o.objectMode;
  var isEncodingOptions = (o) => !o.objectMode && !!o.encoding && o.encoding !== "buffer";

  class Minipass extends node_events_1.EventEmitter {
    [FLOWING] = false;
    [PAUSED] = false;
    [PIPES] = [];
    [BUFFER] = [];
    [OBJECTMODE];
    [ENCODING];
    [ASYNC];
    [DECODER];
    [EOF] = false;
    [EMITTED_END] = false;
    [EMITTING_END] = false;
    [CLOSED] = false;
    [EMITTED_ERROR] = null;
    [BUFFERLENGTH] = 0;
    [DESTROYED] = false;
    [SIGNAL];
    [ABORTED] = false;
    [DATALISTENERS] = 0;
    [DISCARDED] = false;
    writable = true;
    readable = true;
    constructor(...args) {
      const options = args[0] || {};
      super();
      if (options.objectMode && typeof options.encoding === "string") {
        throw new TypeError("Encoding and objectMode may not be used together");
      }
      if (isObjectModeOptions(options)) {
        this[OBJECTMODE] = true;
        this[ENCODING] = null;
      } else if (isEncodingOptions(options)) {
        this[ENCODING] = options.encoding;
        this[OBJECTMODE] = false;
      } else {
        this[OBJECTMODE] = false;
        this[ENCODING] = null;
      }
      this[ASYNC] = !!options.async;
      this[DECODER] = this[ENCODING] ? new node_string_decoder_1.StringDecoder(this[ENCODING]) : null;
      if (options && options.debugExposeBuffer === true) {
        Object.defineProperty(this, "buffer", { get: () => this[BUFFER] });
      }
      if (options && options.debugExposePipes === true) {
        Object.defineProperty(this, "pipes", { get: () => this[PIPES] });
      }
      const { signal } = options;
      if (signal) {
        this[SIGNAL] = signal;
        if (signal.aborted) {
          this[ABORT]();
        } else {
          signal.addEventListener("abort", () => this[ABORT]());
        }
      }
    }
    get bufferLength() {
      return this[BUFFERLENGTH];
    }
    get encoding() {
      return this[ENCODING];
    }
    set encoding(_enc) {
      throw new Error("Encoding must be set at instantiation time");
    }
    setEncoding(_enc) {
      throw new Error("Encoding must be set at instantiation time");
    }
    get objectMode() {
      return this[OBJECTMODE];
    }
    set objectMode(_om) {
      throw new Error("objectMode must be set at instantiation time");
    }
    get ["async"]() {
      return this[ASYNC];
    }
    set ["async"](a) {
      this[ASYNC] = this[ASYNC] || !!a;
    }
    [ABORT]() {
      this[ABORTED] = true;
      this.emit("abort", this[SIGNAL]?.reason);
      this.destroy(this[SIGNAL]?.reason);
    }
    get aborted() {
      return this[ABORTED];
    }
    set aborted(_2) {}
    write(chunk, encoding, cb) {
      if (this[ABORTED])
        return false;
      if (this[EOF])
        throw new Error("write after end");
      if (this[DESTROYED]) {
        this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" }));
        return true;
      }
      if (typeof encoding === "function") {
        cb = encoding;
        encoding = "utf8";
      }
      if (!encoding)
        encoding = "utf8";
      const fn = this[ASYNC] ? defer : nodefer;
      if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
        if (isArrayBufferView(chunk)) {
          chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
        } else if (isArrayBufferLike(chunk)) {
          chunk = Buffer.from(chunk);
        } else if (typeof chunk !== "string") {
          throw new Error("Non-contiguous data written to non-objectMode stream");
        }
      }
      if (this[OBJECTMODE]) {
        if (this[FLOWING] && this[BUFFERLENGTH] !== 0)
          this[FLUSH](true);
        if (this[FLOWING])
          this.emit("data", chunk);
        else
          this[BUFFERPUSH](chunk);
        if (this[BUFFERLENGTH] !== 0)
          this.emit("readable");
        if (cb)
          fn(cb);
        return this[FLOWING];
      }
      if (!chunk.length) {
        if (this[BUFFERLENGTH] !== 0)
          this.emit("readable");
        if (cb)
          fn(cb);
        return this[FLOWING];
      }
      if (typeof chunk === "string" && !(encoding === this[ENCODING] && !this[DECODER]?.lastNeed)) {
        chunk = Buffer.from(chunk, encoding);
      }
      if (Buffer.isBuffer(chunk) && this[ENCODING]) {
        chunk = this[DECODER].write(chunk);
      }
      if (this[FLOWING] && this[BUFFERLENGTH] !== 0)
        this[FLUSH](true);
      if (this[FLOWING])
        this.emit("data", chunk);
      else
        this[BUFFERPUSH](chunk);
      if (this[BUFFERLENGTH] !== 0)
        this.emit("readable");
      if (cb)
        fn(cb);
      return this[FLOWING];
    }
    read(n) {
      if (this[DESTROYED])
        return null;
      this[DISCARDED] = false;
      if (this[BUFFERLENGTH] === 0 || n === 0 || n && n > this[BUFFERLENGTH]) {
        this[MAYBE_EMIT_END]();
        return null;
      }
      if (this[OBJECTMODE])
        n = null;
      if (this[BUFFER].length > 1 && !this[OBJECTMODE]) {
        this[BUFFER] = [
          this[ENCODING] ? this[BUFFER].join("") : Buffer.concat(this[BUFFER], this[BUFFERLENGTH])
        ];
      }
      const ret = this[READ](n || null, this[BUFFER][0]);
      this[MAYBE_EMIT_END]();
      return ret;
    }
    [READ](n, chunk) {
      if (this[OBJECTMODE])
        this[BUFFERSHIFT]();
      else {
        const c = chunk;
        if (n === c.length || n === null)
          this[BUFFERSHIFT]();
        else if (typeof c === "string") {
          this[BUFFER][0] = c.slice(n);
          chunk = c.slice(0, n);
          this[BUFFERLENGTH] -= n;
        } else {
          this[BUFFER][0] = c.subarray(n);
          chunk = c.subarray(0, n);
          this[BUFFERLENGTH] -= n;
        }
      }
      this.emit("data", chunk);
      if (!this[BUFFER].length && !this[EOF])
        this.emit("drain");
      return chunk;
    }
    end(chunk, encoding, cb) {
      if (typeof chunk === "function") {
        cb = chunk;
        chunk = undefined;
      }
      if (typeof encoding === "function") {
        cb = encoding;
        encoding = "utf8";
      }
      if (chunk !== undefined)
        this.write(chunk, encoding);
      if (cb)
        this.once("end", cb);
      this[EOF] = true;
      this.writable = false;
      if (this[FLOWING] || !this[PAUSED])
        this[MAYBE_EMIT_END]();
      return this;
    }
    [RESUME]() {
      if (this[DESTROYED])
        return;
      if (!this[DATALISTENERS] && !this[PIPES].length) {
        this[DISCARDED] = true;
      }
      this[PAUSED] = false;
      this[FLOWING] = true;
      this.emit("resume");
      if (this[BUFFER].length)
        this[FLUSH]();
      else if (this[EOF])
        this[MAYBE_EMIT_END]();
      else
        this.emit("drain");
    }
    resume() {
      return this[RESUME]();
    }
    pause() {
      this[FLOWING] = false;
      this[PAUSED] = true;
      this[DISCARDED] = false;
    }
    get destroyed() {
      return this[DESTROYED];
    }
    get flowing() {
      return this[FLOWING];
    }
    get paused() {
      return this[PAUSED];
    }
    [BUFFERPUSH](chunk) {
      if (this[OBJECTMODE])
        this[BUFFERLENGTH] += 1;
      else
        this[BUFFERLENGTH] += chunk.length;
      this[BUFFER].push(chunk);
    }
    [BUFFERSHIFT]() {
      if (this[OBJECTMODE])
        this[BUFFERLENGTH] -= 1;
      else
        this[BUFFERLENGTH] -= this[BUFFER][0].length;
      return this[BUFFER].shift();
    }
    [FLUSH](noDrain = false) {
      do {} while (this[FLUSHCHUNK](this[BUFFERSHIFT]()) && this[BUFFER].length);
      if (!noDrain && !this[BUFFER].length && !this[EOF])
        this.emit("drain");
    }
    [FLUSHCHUNK](chunk) {
      this.emit("data", chunk);
      return this[FLOWING];
    }
    pipe(dest, opts) {
      if (this[DESTROYED])
        return dest;
      this[DISCARDED] = false;
      const ended = this[EMITTED_END];
      opts = opts || {};
      if (dest === proc.stdout || dest === proc.stderr)
        opts.end = false;
      else
        opts.end = opts.end !== false;
      opts.proxyErrors = !!opts.proxyErrors;
      if (ended) {
        if (opts.end)
          dest.end();
      } else {
        this[PIPES].push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
        if (this[ASYNC])
          defer(() => this[RESUME]());
        else
          this[RESUME]();
      }
      return dest;
    }
    unpipe(dest) {
      const p = this[PIPES].find((p2) => p2.dest === dest);
      if (p) {
        if (this[PIPES].length === 1) {
          if (this[FLOWING] && this[DATALISTENERS] === 0) {
            this[FLOWING] = false;
          }
          this[PIPES] = [];
        } else
          this[PIPES].splice(this[PIPES].indexOf(p), 1);
        p.unpipe();
      }
    }
    addListener(ev, handler) {
      return this.on(ev, handler);
    }
    on(ev, handler) {
      const ret = super.on(ev, handler);
      if (ev === "data") {
        this[DISCARDED] = false;
        this[DATALISTENERS]++;
        if (!this[PIPES].length && !this[FLOWING]) {
          this[RESUME]();
        }
      } else if (ev === "readable" && this[BUFFERLENGTH] !== 0) {
        super.emit("readable");
      } else if (isEndish(ev) && this[EMITTED_END]) {
        super.emit(ev);
        this.removeAllListeners(ev);
      } else if (ev === "error" && this[EMITTED_ERROR]) {
        const h = handler;
        if (this[ASYNC])
          defer(() => h.call(this, this[EMITTED_ERROR]));
        else
          h.call(this, this[EMITTED_ERROR]);
      }
      return ret;
    }
    removeListener(ev, handler) {
      return this.off(ev, handler);
    }
    off(ev, handler) {
      const ret = super.off(ev, handler);
      if (ev === "data") {
        this[DATALISTENERS] = this.listeners("data").length;
        if (this[DATALISTENERS] === 0 && !this[DISCARDED] && !this[PIPES].length) {
          this[FLOWING] = false;
        }
      }
      return ret;
    }
    removeAllListeners(ev) {
      const ret = super.removeAllListeners(ev);
      if (ev === "data" || ev === undefined) {
        this[DATALISTENERS] = 0;
        if (!this[DISCARDED] && !this[PIPES].length) {
          this[FLOWING] = false;
        }
      }
      return ret;
    }
    get emittedEnd() {
      return this[EMITTED_END];
    }
    [MAYBE_EMIT_END]() {
      if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this[BUFFER].length === 0 && this[EOF]) {
        this[EMITTING_END] = true;
        this.emit("end");
        this.emit("prefinish");
        this.emit("finish");
        if (this[CLOSED])
          this.emit("close");
        this[EMITTING_END] = false;
      }
    }
    emit(ev, ...args) {
      const data = args[0];
      if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED]) {
        return false;
      } else if (ev === "data") {
        return !this[OBJECTMODE] && !data ? false : this[ASYNC] ? (defer(() => this[EMITDATA](data)), true) : this[EMITDATA](data);
      } else if (ev === "end") {
        return this[EMITEND]();
      } else if (ev === "close") {
        this[CLOSED] = true;
        if (!this[EMITTED_END] && !this[DESTROYED])
          return false;
        const ret2 = super.emit("close");
        this.removeAllListeners("close");
        return ret2;
      } else if (ev === "error") {
        this[EMITTED_ERROR] = data;
        super.emit(ERROR, data);
        const ret2 = !this[SIGNAL] || this.listeners("error").length ? super.emit("error", data) : false;
        this[MAYBE_EMIT_END]();
        return ret2;
      } else if (ev === "resume") {
        const ret2 = super.emit("resume");
        this[MAYBE_EMIT_END]();
        return ret2;
      } else if (ev === "finish" || ev === "prefinish") {
        const ret2 = super.emit(ev);
        this.removeAllListeners(ev);
        return ret2;
      }
      const ret = super.emit(ev, ...args);
      this[MAYBE_EMIT_END]();
      return ret;
    }
    [EMITDATA](data) {
      for (const p of this[PIPES]) {
        if (p.dest.write(data) === false)
          this.pause();
      }
      const ret = this[DISCARDED] ? false : super.emit("data", data);
      this[MAYBE_EMIT_END]();
      return ret;
    }
    [EMITEND]() {
      if (this[EMITTED_END])
        return false;
      this[EMITTED_END] = true;
      this.readable = false;
      return this[ASYNC] ? (defer(() => this[EMITEND2]()), true) : this[EMITEND2]();
    }
    [EMITEND2]() {
      if (this[DECODER]) {
        const data = this[DECODER].end();
        if (data) {
          for (const p of this[PIPES]) {
            p.dest.write(data);
          }
          if (!this[DISCARDED])
            super.emit("data", data);
        }
      }
      for (const p of this[PIPES]) {
        p.end();
      }
      const ret = super.emit("end");
      this.removeAllListeners("end");
      return ret;
    }
    async collect() {
      const buf = Object.assign([], {
        dataLength: 0
      });
      if (!this[OBJECTMODE])
        buf.dataLength = 0;
      const p = this.promise();
      this.on("data", (c) => {
        buf.push(c);
        if (!this[OBJECTMODE])
          buf.dataLength += c.length;
      });
      await p;
      return buf;
    }
    async concat() {
      if (this[OBJECTMODE]) {
        throw new Error("cannot concat in objectMode");
      }
      const buf = await this.collect();
      return this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength);
    }
    async promise() {
      return new Promise((resolve, reject) => {
        this.on(DESTROYED, () => reject(new Error("stream destroyed")));
        this.on("error", (er) => reject(er));
        this.on("end", () => resolve());
      });
    }
    [Symbol.asyncIterator]() {
      this[DISCARDED] = false;
      let stopped = false;
      const stop = async () => {
        this.pause();
        stopped = true;
        return { value: undefined, done: true };
      };
      const next = () => {
        if (stopped)
          return stop();
        const res = this.read();
        if (res !== null)
          return Promise.resolve({ done: false, value: res });
        if (this[EOF])
          return stop();
        let resolve;
        let reject;
        const onerr = (er) => {
          this.off("data", ondata);
          this.off("end", onend);
          this.off(DESTROYED, ondestroy);
          stop();
          reject(er);
        };
        const ondata = (value) => {
          this.off("error", onerr);
          this.off("end", onend);
          this.off(DESTROYED, ondestroy);
          this.pause();
          resolve({ value, done: !!this[EOF] });
        };
        const onend = () => {
          this.off("error", onerr);
          this.off("data", ondata);
          this.off(DESTROYED, ondestroy);
          stop();
          resolve({ done: true, value: undefined });
        };
        const ondestroy = () => onerr(new Error("stream destroyed"));
        return new Promise((res2, rej) => {
          reject = rej;
          resolve = res2;
          this.once(DESTROYED, ondestroy);
          this.once("error", onerr);
          this.once("end", onend);
          this.once("data", ondata);
        });
      };
      return {
        next,
        throw: stop,
        return: stop,
        [Symbol.asyncIterator]() {
          return this;
        }
      };
    }
    [Symbol.iterator]() {
      this[DISCARDED] = false;
      let stopped = false;
      const stop = () => {
        this.pause();
        this.off(ERROR, stop);
        this.off(DESTROYED, stop);
        this.off("end", stop);
        stopped = true;
        return { done: true, value: undefined };
      };
      const next = () => {
        if (stopped)
          return stop();
        const value = this.read();
        return value === null ? stop() : { done: false, value };
      };
      this.once("end", stop);
      this.once(ERROR, stop);
      this.once(DESTROYED, stop);
      return {
        next,
        throw: stop,
        return: stop,
        [Symbol.iterator]() {
          return this;
        }
      };
    }
    destroy(er) {
      if (this[DESTROYED]) {
        if (er)
          this.emit("error", er);
        else
          this.emit(DESTROYED);
        return this;
      }
      this[DESTROYED] = true;
      this[DISCARDED] = true;
      this[BUFFER].length = 0;
      this[BUFFERLENGTH] = 0;
      const wc = this;
      if (typeof wc.close === "function" && !this[CLOSED])
        wc.close();
      if (er)
        this.emit("error", er);
      else
        this.emit(DESTROYED);
      return this;
    }
    static get isStream() {
      return exports.isStream;
    }
  }
  exports.Minipass = Minipass;
});

// ../../node_modules/.pnpm/path-scurry@1.11.1/node_modules/path-scurry/dist/commonjs/index.js
var require_commonjs4 = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.PathScurry = exports.Path = exports.PathScurryDarwin = exports.PathScurryPosix = exports.PathScurryWin32 = exports.PathScurryBase = exports.PathPosix = exports.PathWin32 = exports.PathBase = exports.ChildrenCache = exports.ResolveCache = undefined;
  var lru_cache_1 = require_commonjs2();
  var node_path_1 = __require("node:path");
  var node_url_1 = __require("node:url");
  var fs_1 = __require("fs");
  var actualFS = __importStar(__require("node:fs"));
  var realpathSync = fs_1.realpathSync.native;
  var promises_1 = __require("node:fs/promises");
  var minipass_1 = require_commonjs3();
  var defaultFS = {
    lstatSync: fs_1.lstatSync,
    readdir: fs_1.readdir,
    readdirSync: fs_1.readdirSync,
    readlinkSync: fs_1.readlinkSync,
    realpathSync,
    promises: {
      lstat: promises_1.lstat,
      readdir: promises_1.readdir,
      readlink: promises_1.readlink,
      realpath: promises_1.realpath
    }
  };
  var fsFromOption = (fsOption) => !fsOption || fsOption === defaultFS || fsOption === actualFS ? defaultFS : {
    ...defaultFS,
    ...fsOption,
    promises: {
      ...defaultFS.promises,
      ...fsOption.promises || {}
    }
  };
  var uncDriveRegexp = /^\\\\\?\\([a-z]:)\\?$/i;
  var uncToDrive = (rootPath) => rootPath.replace(/\//g, "\\").replace(uncDriveRegexp, "$1\\");
  var eitherSep = /[\\\/]/;
  var UNKNOWN = 0;
  var IFIFO = 1;
  var IFCHR = 2;
  var IFDIR = 4;
  var IFBLK = 6;
  var IFREG = 8;
  var IFLNK = 10;
  var IFSOCK = 12;
  var IFMT = 15;
  var IFMT_UNKNOWN = ~IFMT;
  var READDIR_CALLED = 16;
  var LSTAT_CALLED = 32;
  var ENOTDIR = 64;
  var ENOENT = 128;
  var ENOREADLINK = 256;
  var ENOREALPATH = 512;
  var ENOCHILD = ENOTDIR | ENOENT | ENOREALPATH;
  var TYPEMASK = 1023;
  var entToType = (s) => s.isFile() ? IFREG : s.isDirectory() ? IFDIR : s.isSymbolicLink() ? IFLNK : s.isCharacterDevice() ? IFCHR : s.isBlockDevice() ? IFBLK : s.isSocket() ? IFSOCK : s.isFIFO() ? IFIFO : UNKNOWN;
  var normalizeCache = new Map;
  var normalize = (s) => {
    const c = normalizeCache.get(s);
    if (c)
      return c;
    const n = s.normalize("NFKD");
    normalizeCache.set(s, n);
    return n;
  };
  var normalizeNocaseCache = new Map;
  var normalizeNocase = (s) => {
    const c = normalizeNocaseCache.get(s);
    if (c)
      return c;
    const n = normalize(s.toLowerCase());
    normalizeNocaseCache.set(s, n);
    return n;
  };

  class ResolveCache extends lru_cache_1.LRUCache {
    constructor() {
      super({ max: 256 });
    }
  }
  exports.ResolveCache = ResolveCache;

  class ChildrenCache extends lru_cache_1.LRUCache {
    constructor(maxSize = 16 * 1024) {
      super({
        maxSize,
        sizeCalculation: (a) => a.length + 1
      });
    }
  }
  exports.ChildrenCache = ChildrenCache;
  var setAsCwd = Symbol("PathScurry setAsCwd");

  class PathBase {
    name;
    root;
    roots;
    parent;
    nocase;
    isCWD = false;
    #fs;
    #dev;
    get dev() {
      return this.#dev;
    }
    #mode;
    get mode() {
      return this.#mode;
    }
    #nlink;
    get nlink() {
      return this.#nlink;
    }
    #uid;
    get uid() {
      return this.#uid;
    }
    #gid;
    get gid() {
      return this.#gid;
    }
    #rdev;
    get rdev() {
      return this.#rdev;
    }
    #blksize;
    get blksize() {
      return this.#blksize;
    }
    #ino;
    get ino() {
      return this.#ino;
    }
    #size;
    get size() {
      return this.#size;
    }
    #blocks;
    get blocks() {
      return this.#blocks;
    }
    #atimeMs;
    get atimeMs() {
      return this.#atimeMs;
    }
    #mtimeMs;
    get mtimeMs() {
      return this.#mtimeMs;
    }
    #ctimeMs;
    get ctimeMs() {
      return this.#ctimeMs;
    }
    #birthtimeMs;
    get birthtimeMs() {
      return this.#birthtimeMs;
    }
    #atime;
    get atime() {
      return this.#atime;
    }
    #mtime;
    get mtime() {
      return this.#mtime;
    }
    #ctime;
    get ctime() {
      return this.#ctime;
    }
    #birthtime;
    get birthtime() {
      return this.#birthtime;
    }
    #matchName;
    #depth;
    #fullpath;
    #fullpathPosix;
    #relative;
    #relativePosix;
    #type;
    #children;
    #linkTarget;
    #realpath;
    get parentPath() {
      return (this.parent || this).fullpath();
    }
    get path() {
      return this.parentPath;
    }
    constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
      this.name = name;
      this.#matchName = nocase ? normalizeNocase(name) : normalize(name);
      this.#type = type & TYPEMASK;
      this.nocase = nocase;
      this.roots = roots;
      this.root = root || this;
      this.#children = children;
      this.#fullpath = opts.fullpath;
      this.#relative = opts.relative;
      this.#relativePosix = opts.relativePosix;
      this.parent = opts.parent;
      if (this.parent) {
        this.#fs = this.parent.#fs;
      } else {
        this.#fs = fsFromOption(opts.fs);
      }
    }
    depth() {
      if (this.#depth !== undefined)
        return this.#depth;
      if (!this.parent)
        return this.#depth = 0;
      return this.#depth = this.parent.depth() + 1;
    }
    childrenCache() {
      return this.#children;
    }
    resolve(path) {
      if (!path) {
        return this;
      }
      const rootPath = this.getRootString(path);
      const dir = path.substring(rootPath.length);
      const dirParts = dir.split(this.splitSep);
      const result = rootPath ? this.getRoot(rootPath).#resolveParts(dirParts) : this.#resolveParts(dirParts);
      return result;
    }
    #resolveParts(dirParts) {
      let p = this;
      for (const part of dirParts) {
        p = p.child(part);
      }
      return p;
    }
    children() {
      const cached = this.#children.get(this);
      if (cached) {
        return cached;
      }
      const children = Object.assign([], { provisional: 0 });
      this.#children.set(this, children);
      this.#type &= ~READDIR_CALLED;
      return children;
    }
    child(pathPart, opts) {
      if (pathPart === "" || pathPart === ".") {
        return this;
      }
      if (pathPart === "..") {
        return this.parent || this;
      }
      const children = this.children();
      const name = this.nocase ? normalizeNocase(pathPart) : normalize(pathPart);
      for (const p of children) {
        if (p.#matchName === name) {
          return p;
        }
      }
      const s = this.parent ? this.sep : "";
      const fullpath = this.#fullpath ? this.#fullpath + s + pathPart : undefined;
      const pchild = this.newChild(pathPart, UNKNOWN, {
        ...opts,
        parent: this,
        fullpath
      });
      if (!this.canReaddir()) {
        pchild.#type |= ENOENT;
      }
      children.push(pchild);
      return pchild;
    }
    relative() {
      if (this.isCWD)
        return "";
      if (this.#relative !== undefined) {
        return this.#relative;
      }
      const name = this.name;
      const p = this.parent;
      if (!p) {
        return this.#relative = this.name;
      }
      const pv = p.relative();
      return pv + (!pv || !p.parent ? "" : this.sep) + name;
    }
    relativePosix() {
      if (this.sep === "/")
        return this.relative();
      if (this.isCWD)
        return "";
      if (this.#relativePosix !== undefined)
        return this.#relativePosix;
      const name = this.name;
      const p = this.parent;
      if (!p) {
        return this.#relativePosix = this.fullpathPosix();
      }
      const pv = p.relativePosix();
      return pv + (!pv || !p.parent ? "" : "/") + name;
    }
    fullpath() {
      if (this.#fullpath !== undefined) {
        return this.#fullpath;
      }
      const name = this.name;
      const p = this.parent;
      if (!p) {
        return this.#fullpath = this.name;
      }
      const pv = p.fullpath();
      const fp = pv + (!p.parent ? "" : this.sep) + name;
      return this.#fullpath = fp;
    }
    fullpathPosix() {
      if (this.#fullpathPosix !== undefined)
        return this.#fullpathPosix;
      if (this.sep === "/")
        return this.#fullpathPosix = this.fullpath();
      if (!this.parent) {
        const p2 = this.fullpath().replace(/\\/g, "/");
        if (/^[a-z]:\//i.test(p2)) {
          return this.#fullpathPosix = `//?/${p2}`;
        } else {
          return this.#fullpathPosix = p2;
        }
      }
      const p = this.parent;
      const pfpp = p.fullpathPosix();
      const fpp = pfpp + (!pfpp || !p.parent ? "" : "/") + this.name;
      return this.#fullpathPosix = fpp;
    }
    isUnknown() {
      return (this.#type & IFMT) === UNKNOWN;
    }
    isType(type) {
      return this[`is${type}`]();
    }
    getType() {
      return this.isUnknown() ? "Unknown" : this.isDirectory() ? "Directory" : this.isFile() ? "File" : this.isSymbolicLink() ? "SymbolicLink" : this.isFIFO() ? "FIFO" : this.isCharacterDevice() ? "CharacterDevice" : this.isBlockDevice() ? "BlockDevice" : this.isSocket() ? "Socket" : "Unknown";
    }
    isFile() {
      return (this.#type & IFMT) === IFREG;
    }
    isDirectory() {
      return (this.#type & IFMT) === IFDIR;
    }
    isCharacterDevice() {
      return (this.#type & IFMT) === IFCHR;
    }
    isBlockDevice() {
      return (this.#type & IFMT) === IFBLK;
    }
    isFIFO() {
      return (this.#type & IFMT) === IFIFO;
    }
    isSocket() {
      return (this.#type & IFMT) === IFSOCK;
    }
    isSymbolicLink() {
      return (this.#type & IFLNK) === IFLNK;
    }
    lstatCached() {
      return this.#type & LSTAT_CALLED ? this : undefined;
    }
    readlinkCached() {
      return this.#linkTarget;
    }
    realpathCached() {
      return this.#realpath;
    }
    readdirCached() {
      const children = this.children();
      return children.slice(0, children.provisional);
    }
    canReadlink() {
      if (this.#linkTarget)
        return true;
      if (!this.parent)
        return false;
      const ifmt = this.#type & IFMT;
      return !(ifmt !== UNKNOWN && ifmt !== IFLNK || this.#type & ENOREADLINK || this.#type & ENOENT);
    }
    calledReaddir() {
      return !!(this.#type & READDIR_CALLED);
    }
    isENOENT() {
      return !!(this.#type & ENOENT);
    }
    isNamed(n) {
      return !this.nocase ? this.#matchName === normalize(n) : this.#matchName === normalizeNocase(n);
    }
    async readlink() {
      const target = this.#linkTarget;
      if (target) {
        return target;
      }
      if (!this.canReadlink()) {
        return;
      }
      if (!this.parent) {
        return;
      }
      try {
        const read = await this.#fs.promises.readlink(this.fullpath());
        const linkTarget = (await this.parent.realpath())?.resolve(read);
        if (linkTarget) {
          return this.#linkTarget = linkTarget;
        }
      } catch (er) {
        this.#readlinkFail(er.code);
        return;
      }
    }
    readlinkSync() {
      const target = this.#linkTarget;
      if (target) {
        return target;
      }
      if (!this.canReadlink()) {
        return;
      }
      if (!this.parent) {
        return;
      }
      try {
        const read = this.#fs.readlinkSync(this.fullpath());
        const linkTarget = this.parent.realpathSync()?.resolve(read);
        if (linkTarget) {
          return this.#linkTarget = linkTarget;
        }
      } catch (er) {
        this.#readlinkFail(er.code);
        return;
      }
    }
    #readdirSuccess(children) {
      this.#type |= READDIR_CALLED;
      for (let p = children.provisional;p < children.length; p++) {
        const c = children[p];
        if (c)
          c.#markENOENT();
      }
    }
    #markENOENT() {
      if (this.#type & ENOENT)
        return;
      this.#type = (this.#type | ENOENT) & IFMT_UNKNOWN;
      this.#markChildrenENOENT();
    }
    #markChildrenENOENT() {
      const children = this.children();
      children.provisional = 0;
      for (const p of children) {
        p.#markENOENT();
      }
    }
    #markENOREALPATH() {
      this.#type |= ENOREALPATH;
      this.#markENOTDIR();
    }
    #markENOTDIR() {
      if (this.#type & ENOTDIR)
        return;
      let t = this.#type;
      if ((t & IFMT) === IFDIR)
        t &= IFMT_UNKNOWN;
      this.#type = t | ENOTDIR;
      this.#markChildrenENOENT();
    }
    #readdirFail(code = "") {
      if (code === "ENOTDIR" || code === "EPERM") {
        this.#markENOTDIR();
      } else if (code === "ENOENT") {
        this.#markENOENT();
      } else {
        this.children().provisional = 0;
      }
    }
    #lstatFail(code = "") {
      if (code === "ENOTDIR") {
        const p = this.parent;
        p.#markENOTDIR();
      } else if (code === "ENOENT") {
        this.#markENOENT();
      }
    }
    #readlinkFail(code = "") {
      let ter = this.#type;
      ter |= ENOREADLINK;
      if (code === "ENOENT")
        ter |= ENOENT;
      if (code === "EINVAL" || code === "UNKNOWN") {
        ter &= IFMT_UNKNOWN;
      }
      this.#type = ter;
      if (code === "ENOTDIR" && this.parent) {
        this.parent.#markENOTDIR();
      }
    }
    #readdirAddChild(e, c) {
      return this.#readdirMaybePromoteChild(e, c) || this.#readdirAddNewChild(e, c);
    }
    #readdirAddNewChild(e, c) {
      const type = entToType(e);
      const child = this.newChild(e.name, type, { parent: this });
      const ifmt = child.#type & IFMT;
      if (ifmt !== IFDIR && ifmt !== IFLNK && ifmt !== UNKNOWN) {
        child.#type |= ENOTDIR;
      }
      c.unshift(child);
      c.provisional++;
      return child;
    }
    #readdirMaybePromoteChild(e, c) {
      for (let p = c.provisional;p < c.length; p++) {
        const pchild = c[p];
        const name = this.nocase ? normalizeNocase(e.name) : normalize(e.name);
        if (name !== pchild.#matchName) {
          continue;
        }
        return this.#readdirPromoteChild(e, pchild, p, c);
      }
    }
    #readdirPromoteChild(e, p, index, c) {
      const v = p.name;
      p.#type = p.#type & IFMT_UNKNOWN | entToType(e);
      if (v !== e.name)
        p.name = e.name;
      if (index !== c.provisional) {
        if (index === c.length - 1)
          c.pop();
        else
          c.splice(index, 1);
        c.unshift(p);
      }
      c.provisional++;
      return p;
    }
    async lstat() {
      if ((this.#type & ENOENT) === 0) {
        try {
          this.#applyStat(await this.#fs.promises.lstat(this.fullpath()));
          return this;
        } catch (er) {
          this.#lstatFail(er.code);
        }
      }
    }
    lstatSync() {
      if ((this.#type & ENOENT) === 0) {
        try {
          this.#applyStat(this.#fs.lstatSync(this.fullpath()));
          return this;
        } catch (er) {
          this.#lstatFail(er.code);
        }
      }
    }
    #applyStat(st) {
      const { atime, atimeMs, birthtime, birthtimeMs, blksize, blocks, ctime, ctimeMs, dev, gid, ino, mode, mtime, mtimeMs, nlink, rdev, size, uid } = st;
      this.#atime = atime;
      this.#atimeMs = atimeMs;
      this.#birthtime = birthtime;
      this.#birthtimeMs = birthtimeMs;
      this.#blksize = blksize;
      this.#blocks = blocks;
      this.#ctime = ctime;
      this.#ctimeMs = ctimeMs;
      this.#dev = dev;
      this.#gid = gid;
      this.#ino = ino;
      this.#mode = mode;
      this.#mtime = mtime;
      this.#mtimeMs = mtimeMs;
      this.#nlink = nlink;
      this.#rdev = rdev;
      this.#size = size;
      this.#uid = uid;
      const ifmt = entToType(st);
      this.#type = this.#type & IFMT_UNKNOWN | ifmt | LSTAT_CALLED;
      if (ifmt !== UNKNOWN && ifmt !== IFDIR && ifmt !== IFLNK) {
        this.#type |= ENOTDIR;
      }
    }
    #onReaddirCB = [];
    #readdirCBInFlight = false;
    #callOnReaddirCB(children) {
      this.#readdirCBInFlight = false;
      const cbs = this.#onReaddirCB.slice();
      this.#onReaddirCB.length = 0;
      cbs.forEach((cb) => cb(null, children));
    }
    readdirCB(cb, allowZalgo = false) {
      if (!this.canReaddir()) {
        if (allowZalgo)
          cb(null, []);
        else
          queueMicrotask(() => cb(null, []));
        return;
      }
      const children = this.children();
      if (this.calledReaddir()) {
        const c = children.slice(0, children.provisional);
        if (allowZalgo)
          cb(null, c);
        else
          queueMicrotask(() => cb(null, c));
        return;
      }
      this.#onReaddirCB.push(cb);
      if (this.#readdirCBInFlight) {
        return;
      }
      this.#readdirCBInFlight = true;
      const fullpath = this.fullpath();
      this.#fs.readdir(fullpath, { withFileTypes: true }, (er, entries) => {
        if (er) {
          this.#readdirFail(er.code);
          children.provisional = 0;
        } else {
          for (const e of entries) {
            this.#readdirAddChild(e, children);
          }
          this.#readdirSuccess(children);
        }
        this.#callOnReaddirCB(children.slice(0, children.provisional));
        return;
      });
    }
    #asyncReaddirInFlight;
    async readdir() {
      if (!this.canReaddir()) {
        return [];
      }
      const children = this.children();
      if (this.calledReaddir()) {
        return children.slice(0, children.provisional);
      }
      const fullpath = this.fullpath();
      if (this.#asyncReaddirInFlight) {
        await this.#asyncReaddirInFlight;
      } else {
        let resolve = () => {};
        this.#asyncReaddirInFlight = new Promise((res) => resolve = res);
        try {
          for (const e of await this.#fs.promises.readdir(fullpath, {
            withFileTypes: true
          })) {
            this.#readdirAddChild(e, children);
          }
          this.#readdirSuccess(children);
        } catch (er) {
          this.#readdirFail(er.code);
          children.provisional = 0;
        }
        this.#asyncReaddirInFlight = undefined;
        resolve();
      }
      return children.slice(0, children.provisional);
    }
    readdirSync() {
      if (!this.canReaddir()) {
        return [];
      }
      const children = this.children();
      if (this.calledReaddir()) {
        return children.slice(0, children.provisional);
      }
      const fullpath = this.fullpath();
      try {
        for (const e of this.#fs.readdirSync(fullpath, {
          withFileTypes: true
        })) {
          this.#readdirAddChild(e, children);
        }
        this.#readdirSuccess(children);
      } catch (er) {
        this.#readdirFail(er.code);
        children.provisional = 0;
      }
      return children.slice(0, children.provisional);
    }
    canReaddir() {
      if (this.#type & ENOCHILD)
        return false;
      const ifmt = IFMT & this.#type;
      if (!(ifmt === UNKNOWN || ifmt === IFDIR || ifmt === IFLNK)) {
        return false;
      }
      return true;
    }
    shouldWalk(dirs, walkFilter) {
      return (this.#type & IFDIR) === IFDIR && !(this.#type & ENOCHILD) && !dirs.has(this) && (!walkFilter || walkFilter(this));
    }
    async realpath() {
      if (this.#realpath)
        return this.#realpath;
      if ((ENOREALPATH | ENOREADLINK | ENOENT) & this.#type)
        return;
      try {
        const rp = await this.#fs.promises.realpath(this.fullpath());
        return this.#realpath = this.resolve(rp);
      } catch (_2) {
        this.#markENOREALPATH();
      }
    }
    realpathSync() {
      if (this.#realpath)
        return this.#realpath;
      if ((ENOREALPATH | ENOREADLINK | ENOENT) & this.#type)
        return;
      try {
        const rp = this.#fs.realpathSync(this.fullpath());
        return this.#realpath = this.resolve(rp);
      } catch (_2) {
        this.#markENOREALPATH();
      }
    }
    [setAsCwd](oldCwd) {
      if (oldCwd === this)
        return;
      oldCwd.isCWD = false;
      this.isCWD = true;
      const changed = new Set([]);
      let rp = [];
      let p = this;
      while (p && p.parent) {
        changed.add(p);
        p.#relative = rp.join(this.sep);
        p.#relativePosix = rp.join("/");
        p = p.parent;
        rp.push("..");
      }
      p = oldCwd;
      while (p && p.parent && !changed.has(p)) {
        p.#relative = undefined;
        p.#relativePosix = undefined;
        p = p.parent;
      }
    }
  }
  exports.PathBase = PathBase;

  class PathWin32 extends PathBase {
    sep = "\\";
    splitSep = eitherSep;
    constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
      super(name, type, root, roots, nocase, children, opts);
    }
    newChild(name, type = UNKNOWN, opts = {}) {
      return new PathWin32(name, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
    }
    getRootString(path) {
      return node_path_1.win32.parse(path).root;
    }
    getRoot(rootPath) {
      rootPath = uncToDrive(rootPath.toUpperCase());
      if (rootPath === this.root.name) {
        return this.root;
      }
      for (const [compare, root] of Object.entries(this.roots)) {
        if (this.sameRoot(rootPath, compare)) {
          return this.roots[rootPath] = root;
        }
      }
      return this.roots[rootPath] = new PathScurryWin32(rootPath, this).root;
    }
    sameRoot(rootPath, compare = this.root.name) {
      rootPath = rootPath.toUpperCase().replace(/\//g, "\\").replace(uncDriveRegexp, "$1\\");
      return rootPath === compare;
    }
  }
  exports.PathWin32 = PathWin32;

  class PathPosix extends PathBase {
    splitSep = "/";
    sep = "/";
    constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
      super(name, type, root, roots, nocase, children, opts);
    }
    getRootString(path) {
      return path.startsWith("/") ? "/" : "";
    }
    getRoot(_rootPath) {
      return this.root;
    }
    newChild(name, type = UNKNOWN, opts = {}) {
      return new PathPosix(name, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
    }
  }
  exports.PathPosix = PathPosix;

  class PathScurryBase {
    root;
    rootPath;
    roots;
    cwd;
    #resolveCache;
    #resolvePosixCache;
    #children;
    nocase;
    #fs;
    constructor(cwd = process.cwd(), pathImpl, sep, { nocase, childrenCacheSize = 16 * 1024, fs = defaultFS } = {}) {
      this.#fs = fsFromOption(fs);
      if (cwd instanceof URL || cwd.startsWith("file://")) {
        cwd = (0, node_url_1.fileURLToPath)(cwd);
      }
      const cwdPath = pathImpl.resolve(cwd);
      this.roots = Object.create(null);
      this.rootPath = this.parseRootPath(cwdPath);
      this.#resolveCache = new ResolveCache;
      this.#resolvePosixCache = new ResolveCache;
      this.#children = new ChildrenCache(childrenCacheSize);
      const split = cwdPath.substring(this.rootPath.length).split(sep);
      if (split.length === 1 && !split[0]) {
        split.pop();
      }
      if (nocase === undefined) {
        throw new TypeError("must provide nocase setting to PathScurryBase ctor");
      }
      this.nocase = nocase;
      this.root = this.newRoot(this.#fs);
      this.roots[this.rootPath] = this.root;
      let prev = this.root;
      let len = split.length - 1;
      const joinSep = pathImpl.sep;
      let abs = this.rootPath;
      let sawFirst = false;
      for (const part of split) {
        const l = len--;
        prev = prev.child(part, {
          relative: new Array(l).fill("..").join(joinSep),
          relativePosix: new Array(l).fill("..").join("/"),
          fullpath: abs += (sawFirst ? "" : joinSep) + part
        });
        sawFirst = true;
      }
      this.cwd = prev;
    }
    depth(path = this.cwd) {
      if (typeof path === "string") {
        path = this.cwd.resolve(path);
      }
      return path.depth();
    }
    childrenCache() {
      return this.#children;
    }
    resolve(...paths) {
      let r = "";
      for (let i = paths.length - 1;i >= 0; i--) {
        const p = paths[i];
        if (!p || p === ".")
          continue;
        r = r ? `${p}/${r}` : p;
        if (this.isAbsolute(p)) {
          break;
        }
      }
      const cached = this.#resolveCache.get(r);
      if (cached !== undefined) {
        return cached;
      }
      const result = this.cwd.resolve(r).fullpath();
      this.#resolveCache.set(r, result);
      return result;
    }
    resolvePosix(...paths) {
      let r = "";
      for (let i = paths.length - 1;i >= 0; i--) {
        const p = paths[i];
        if (!p || p === ".")
          continue;
        r = r ? `${p}/${r}` : p;
        if (this.isAbsolute(p)) {
          break;
        }
      }
      const cached = this.#resolvePosixCache.get(r);
      if (cached !== undefined) {
        return cached;
      }
      const result = this.cwd.resolve(r).fullpathPosix();
      this.#resolvePosixCache.set(r, result);
      return result;
    }
    relative(entry = this.cwd) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      }
      return entry.relative();
    }
    relativePosix(entry = this.cwd) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      }
      return entry.relativePosix();
    }
    basename(entry = this.cwd) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      }
      return entry.name;
    }
    dirname(entry = this.cwd) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      }
      return (entry.parent || entry).fullpath();
    }
    async readdir(entry = this.cwd, opts = {
      withFileTypes: true
    }) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      } else if (!(entry instanceof PathBase)) {
        opts = entry;
        entry = this.cwd;
      }
      const { withFileTypes } = opts;
      if (!entry.canReaddir()) {
        return [];
      } else {
        const p = await entry.readdir();
        return withFileTypes ? p : p.map((e) => e.name);
      }
    }
    readdirSync(entry = this.cwd, opts = {
      withFileTypes: true
    }) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      } else if (!(entry instanceof PathBase)) {
        opts = entry;
        entry = this.cwd;
      }
      const { withFileTypes = true } = opts;
      if (!entry.canReaddir()) {
        return [];
      } else if (withFileTypes) {
        return entry.readdirSync();
      } else {
        return entry.readdirSync().map((e) => e.name);
      }
    }
    async lstat(entry = this.cwd) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      }
      return entry.lstat();
    }
    lstatSync(entry = this.cwd) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      }
      return entry.lstatSync();
    }
    async readlink(entry = this.cwd, { withFileTypes } = {
      withFileTypes: false
    }) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      } else if (!(entry instanceof PathBase)) {
        withFileTypes = entry.withFileTypes;
        entry = this.cwd;
      }
      const e = await entry.readlink();
      return withFileTypes ? e : e?.fullpath();
    }
    readlinkSync(entry = this.cwd, { withFileTypes } = {
      withFileTypes: false
    }) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      } else if (!(entry instanceof PathBase)) {
        withFileTypes = entry.withFileTypes;
        entry = this.cwd;
      }
      const e = entry.readlinkSync();
      return withFileTypes ? e : e?.fullpath();
    }
    async realpath(entry = this.cwd, { withFileTypes } = {
      withFileTypes: false
    }) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      } else if (!(entry instanceof PathBase)) {
        withFileTypes = entry.withFileTypes;
        entry = this.cwd;
      }
      const e = await entry.realpath();
      return withFileTypes ? e : e?.fullpath();
    }
    realpathSync(entry = this.cwd, { withFileTypes } = {
      withFileTypes: false
    }) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      } else if (!(entry instanceof PathBase)) {
        withFileTypes = entry.withFileTypes;
        entry = this.cwd;
      }
      const e = entry.realpathSync();
      return withFileTypes ? e : e?.fullpath();
    }
    async walk(entry = this.cwd, opts = {}) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      } else if (!(entry instanceof PathBase)) {
        opts = entry;
        entry = this.cwd;
      }
      const { withFileTypes = true, follow = false, filter, walkFilter } = opts;
      const results = [];
      if (!filter || filter(entry)) {
        results.push(withFileTypes ? entry : entry.fullpath());
      }
      const dirs = new Set;
      const walk = (dir, cb) => {
        dirs.add(dir);
        dir.readdirCB((er, entries) => {
          if (er) {
            return cb(er);
          }
          let len = entries.length;
          if (!len)
            return cb();
          const next = () => {
            if (--len === 0) {
              cb();
            }
          };
          for (const e of entries) {
            if (!filter || filter(e)) {
              results.push(withFileTypes ? e : e.fullpath());
            }
            if (follow && e.isSymbolicLink()) {
              e.realpath().then((r) => r?.isUnknown() ? r.lstat() : r).then((r) => r?.shouldWalk(dirs, walkFilter) ? walk(r, next) : next());
            } else {
              if (e.shouldWalk(dirs, walkFilter)) {
                walk(e, next);
              } else {
                next();
              }
            }
          }
        }, true);
      };
      const start = entry;
      return new Promise((res, rej) => {
        walk(start, (er) => {
          if (er)
            return rej(er);
          res(results);
        });
      });
    }
    walkSync(entry = this.cwd, opts = {}) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      } else if (!(entry instanceof PathBase)) {
        opts = entry;
        entry = this.cwd;
      }
      const { withFileTypes = true, follow = false, filter, walkFilter } = opts;
      const results = [];
      if (!filter || filter(entry)) {
        results.push(withFileTypes ? entry : entry.fullpath());
      }
      const dirs = new Set([entry]);
      for (const dir of dirs) {
        const entries = dir.readdirSync();
        for (const e of entries) {
          if (!filter || filter(e)) {
            results.push(withFileTypes ? e : e.fullpath());
          }
          let r = e;
          if (e.isSymbolicLink()) {
            if (!(follow && (r = e.realpathSync())))
              continue;
            if (r.isUnknown())
              r.lstatSync();
          }
          if (r.shouldWalk(dirs, walkFilter)) {
            dirs.add(r);
          }
        }
      }
      return results;
    }
    [Symbol.asyncIterator]() {
      return this.iterate();
    }
    iterate(entry = this.cwd, options = {}) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      } else if (!(entry instanceof PathBase)) {
        options = entry;
        entry = this.cwd;
      }
      return this.stream(entry, options)[Symbol.asyncIterator]();
    }
    [Symbol.iterator]() {
      return this.iterateSync();
    }
    *iterateSync(entry = this.cwd, opts = {}) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      } else if (!(entry instanceof PathBase)) {
        opts = entry;
        entry = this.cwd;
      }
      const { withFileTypes = true, follow = false, filter, walkFilter } = opts;
      if (!filter || filter(entry)) {
        yield withFileTypes ? entry : entry.fullpath();
      }
      const dirs = new Set([entry]);
      for (const dir of dirs) {
        const entries = dir.readdirSync();
        for (const e of entries) {
          if (!filter || filter(e)) {
            yield withFileTypes ? e : e.fullpath();
          }
          let r = e;
          if (e.isSymbolicLink()) {
            if (!(follow && (r = e.realpathSync())))
              continue;
            if (r.isUnknown())
              r.lstatSync();
          }
          if (r.shouldWalk(dirs, walkFilter)) {
            dirs.add(r);
          }
        }
      }
    }
    stream(entry = this.cwd, opts = {}) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      } else if (!(entry instanceof PathBase)) {
        opts = entry;
        entry = this.cwd;
      }
      const { withFileTypes = true, follow = false, filter, walkFilter } = opts;
      const results = new minipass_1.Minipass({ objectMode: true });
      if (!filter || filter(entry)) {
        results.write(withFileTypes ? entry : entry.fullpath());
      }
      const dirs = new Set;
      const queue = [entry];
      let processing = 0;
      const process2 = () => {
        let paused = false;
        while (!paused) {
          const dir = queue.shift();
          if (!dir) {
            if (processing === 0)
              results.end();
            return;
          }
          processing++;
          dirs.add(dir);
          const onReaddir = (er, entries, didRealpaths = false) => {
            if (er)
              return results.emit("error", er);
            if (follow && !didRealpaths) {
              const promises = [];
              for (const e of entries) {
                if (e.isSymbolicLink()) {
                  promises.push(e.realpath().then((r) => r?.isUnknown() ? r.lstat() : r));
                }
              }
              if (promises.length) {
                Promise.all(promises).then(() => onReaddir(null, entries, true));
                return;
              }
            }
            for (const e of entries) {
              if (e && (!filter || filter(e))) {
                if (!results.write(withFileTypes ? e : e.fullpath())) {
                  paused = true;
                }
              }
            }
            processing--;
            for (const e of entries) {
              const r = e.realpathCached() || e;
              if (r.shouldWalk(dirs, walkFilter)) {
                queue.push(r);
              }
            }
            if (paused && !results.flowing) {
              results.once("drain", process2);
            } else if (!sync) {
              process2();
            }
          };
          let sync = true;
          dir.readdirCB(onReaddir, true);
          sync = false;
        }
      };
      process2();
      return results;
    }
    streamSync(entry = this.cwd, opts = {}) {
      if (typeof entry === "string") {
        entry = this.cwd.resolve(entry);
      } else if (!(entry instanceof PathBase)) {
        opts = entry;
        entry = this.cwd;
      }
      const { withFileTypes = true, follow = false, filter, walkFilter } = opts;
      const results = new minipass_1.Minipass({ objectMode: true });
      const dirs = new Set;
      if (!filter || filter(entry)) {
        results.write(withFileTypes ? entry : entry.fullpath());
      }
      const queue = [entry];
      let processing = 0;
      const process2 = () => {
        let paused = false;
        while (!paused) {
          const dir = queue.shift();
          if (!dir) {
            if (processing === 0)
              results.end();
            return;
          }
          processing++;
          dirs.add(dir);
          const entries = dir.readdirSync();
          for (const e of entries) {
            if (!filter || filter(e)) {
              if (!results.write(withFileTypes ? e : e.fullpath())) {
                paused = true;
              }
            }
          }
          processing--;
          for (const e of entries) {
            let r = e;
            if (e.isSymbolicLink()) {
              if (!(follow && (r = e.realpathSync())))
                continue;
              if (r.isUnknown())
                r.lstatSync();
            }
            if (r.shouldWalk(dirs, walkFilter)) {
              queue.push(r);
            }
          }
        }
        if (paused && !results.flowing)
          results.once("drain", process2);
      };
      process2();
      return results;
    }
    chdir(path = this.cwd) {
      const oldCwd = this.cwd;
      this.cwd = typeof path === "string" ? this.cwd.resolve(path) : path;
      this.cwd[setAsCwd](oldCwd);
    }
  }
  exports.PathScurryBase = PathScurryBase;

  class PathScurryWin32 extends PathScurryBase {
    sep = "\\";
    constructor(cwd = process.cwd(), opts = {}) {
      const { nocase = true } = opts;
      super(cwd, node_path_1.win32, "\\", { ...opts, nocase });
      this.nocase = nocase;
      for (let p = this.cwd;p; p = p.parent) {
        p.nocase = this.nocase;
      }
    }
    parseRootPath(dir) {
      return node_path_1.win32.parse(dir).root.toUpperCase();
    }
    newRoot(fs) {
      return new PathWin32(this.rootPath, IFDIR, undefined, this.roots, this.nocase, this.childrenCache(), { fs });
    }
    isAbsolute(p) {
      return p.startsWith("/") || p.startsWith("\\") || /^[a-z]:(\/|\\)/i.test(p);
    }
  }
  exports.PathScurryWin32 = PathScurryWin32;

  class PathScurryPosix extends PathScurryBase {
    sep = "/";
    constructor(cwd = process.cwd(), opts = {}) {
      const { nocase = false } = opts;
      super(cwd, node_path_1.posix, "/", { ...opts, nocase });
      this.nocase = nocase;
    }
    parseRootPath(_dir) {
      return "/";
    }
    newRoot(fs) {
      return new PathPosix(this.rootPath, IFDIR, undefined, this.roots, this.nocase, this.childrenCache(), { fs });
    }
    isAbsolute(p) {
      return p.startsWith("/");
    }
  }
  exports.PathScurryPosix = PathScurryPosix;

  class PathScurryDarwin extends PathScurryPosix {
    constructor(cwd = process.cwd(), opts = {}) {
      const { nocase = true } = opts;
      super(cwd, { ...opts, nocase });
    }
  }
  exports.PathScurryDarwin = PathScurryDarwin;
  exports.Path = process.platform === "win32" ? PathWin32 : PathPosix;
  exports.PathScurry = process.platform === "win32" ? PathScurryWin32 : process.platform === "darwin" ? PathScurryDarwin : PathScurryPosix;
});

// ../../node_modules/.pnpm/glob@10.5.0/node_modules/glob/dist/commonjs/pattern.js
var require_pattern = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Pattern = undefined;
  var minimatch_1 = require_commonjs();
  var isPatternList = (pl) => pl.length >= 1;
  var isGlobList = (gl) => gl.length >= 1;

  class Pattern {
    #patternList;
    #globList;
    #index;
    length;
    #platform;
    #rest;
    #globString;
    #isDrive;
    #isUNC;
    #isAbsolute;
    #followGlobstar = true;
    constructor(patternList, globList, index, platform) {
      if (!isPatternList(patternList)) {
        throw new TypeError("empty pattern list");
      }
      if (!isGlobList(globList)) {
        throw new TypeError("empty glob list");
      }
      if (globList.length !== patternList.length) {
        throw new TypeError("mismatched pattern list and glob list lengths");
      }
      this.length = patternList.length;
      if (index < 0 || index >= this.length) {
        throw new TypeError("index out of range");
      }
      this.#patternList = patternList;
      this.#globList = globList;
      this.#index = index;
      this.#platform = platform;
      if (this.#index === 0) {
        if (this.isUNC()) {
          const [p0, p1, p2, p3, ...prest] = this.#patternList;
          const [g0, g1, g2, g3, ...grest] = this.#globList;
          if (prest[0] === "") {
            prest.shift();
            grest.shift();
          }
          const p = [p0, p1, p2, p3, ""].join("/");
          const g = [g0, g1, g2, g3, ""].join("/");
          this.#patternList = [p, ...prest];
          this.#globList = [g, ...grest];
          this.length = this.#patternList.length;
        } else if (this.isDrive() || this.isAbsolute()) {
          const [p1, ...prest] = this.#patternList;
          const [g1, ...grest] = this.#globList;
          if (prest[0] === "") {
            prest.shift();
            grest.shift();
          }
          const p = p1 + "/";
          const g = g1 + "/";
          this.#patternList = [p, ...prest];
          this.#globList = [g, ...grest];
          this.length = this.#patternList.length;
        }
      }
    }
    pattern() {
      return this.#patternList[this.#index];
    }
    isString() {
      return typeof this.#patternList[this.#index] === "string";
    }
    isGlobstar() {
      return this.#patternList[this.#index] === minimatch_1.GLOBSTAR;
    }
    isRegExp() {
      return this.#patternList[this.#index] instanceof RegExp;
    }
    globString() {
      return this.#globString = this.#globString || (this.#index === 0 ? this.isAbsolute() ? this.#globList[0] + this.#globList.slice(1).join("/") : this.#globList.join("/") : this.#globList.slice(this.#index).join("/"));
    }
    hasMore() {
      return this.length > this.#index + 1;
    }
    rest() {
      if (this.#rest !== undefined)
        return this.#rest;
      if (!this.hasMore())
        return this.#rest = null;
      this.#rest = new Pattern(this.#patternList, this.#globList, this.#index + 1, this.#platform);
      this.#rest.#isAbsolute = this.#isAbsolute;
      this.#rest.#isUNC = this.#isUNC;
      this.#rest.#isDrive = this.#isDrive;
      return this.#rest;
    }
    isUNC() {
      const pl = this.#patternList;
      return this.#isUNC !== undefined ? this.#isUNC : this.#isUNC = this.#platform === "win32" && this.#index === 0 && pl[0] === "" && pl[1] === "" && typeof pl[2] === "string" && !!pl[2] && typeof pl[3] === "string" && !!pl[3];
    }
    isDrive() {
      const pl = this.#patternList;
      return this.#isDrive !== undefined ? this.#isDrive : this.#isDrive = this.#platform === "win32" && this.#index === 0 && this.length > 1 && typeof pl[0] === "string" && /^[a-z]:$/i.test(pl[0]);
    }
    isAbsolute() {
      const pl = this.#patternList;
      return this.#isAbsolute !== undefined ? this.#isAbsolute : this.#isAbsolute = pl[0] === "" && pl.length > 1 || this.isDrive() || this.isUNC();
    }
    root() {
      const p = this.#patternList[0];
      return typeof p === "string" && this.isAbsolute() && this.#index === 0 ? p : "";
    }
    checkFollowGlobstar() {
      return !(this.#index === 0 || !this.isGlobstar() || !this.#followGlobstar);
    }
    markFollowGlobstar() {
      if (this.#index === 0 || !this.isGlobstar() || !this.#followGlobstar)
        return false;
      this.#followGlobstar = false;
      return true;
    }
  }
  exports.Pattern = Pattern;
});

// ../../node_modules/.pnpm/glob@10.5.0/node_modules/glob/dist/commonjs/ignore.js
var require_ignore = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Ignore = undefined;
  var minimatch_1 = require_commonjs();
  var pattern_js_1 = require_pattern();
  var defaultPlatform = typeof process === "object" && process && typeof process.platform === "string" ? process.platform : "linux";

  class Ignore {
    relative;
    relativeChildren;
    absolute;
    absoluteChildren;
    platform;
    mmopts;
    constructor(ignored, { nobrace, nocase, noext, noglobstar, platform = defaultPlatform }) {
      this.relative = [];
      this.absolute = [];
      this.relativeChildren = [];
      this.absoluteChildren = [];
      this.platform = platform;
      this.mmopts = {
        dot: true,
        nobrace,
        nocase,
        noext,
        noglobstar,
        optimizationLevel: 2,
        platform,
        nocomment: true,
        nonegate: true
      };
      for (const ign of ignored)
        this.add(ign);
    }
    add(ign) {
      const mm = new minimatch_1.Minimatch(ign, this.mmopts);
      for (let i = 0;i < mm.set.length; i++) {
        const parsed = mm.set[i];
        const globParts = mm.globParts[i];
        if (!parsed || !globParts) {
          throw new Error("invalid pattern object");
        }
        while (parsed[0] === "." && globParts[0] === ".") {
          parsed.shift();
          globParts.shift();
        }
        const p = new pattern_js_1.Pattern(parsed, globParts, 0, this.platform);
        const m = new minimatch_1.Minimatch(p.globString(), this.mmopts);
        const children = globParts[globParts.length - 1] === "**";
        const absolute = p.isAbsolute();
        if (absolute)
          this.absolute.push(m);
        else
          this.relative.push(m);
        if (children) {
          if (absolute)
            this.absoluteChildren.push(m);
          else
            this.relativeChildren.push(m);
        }
      }
    }
    ignored(p) {
      const fullpath = p.fullpath();
      const fullpaths = `${fullpath}/`;
      const relative = p.relative() || ".";
      const relatives = `${relative}/`;
      for (const m of this.relative) {
        if (m.match(relative) || m.match(relatives))
          return true;
      }
      for (const m of this.absolute) {
        if (m.match(fullpath) || m.match(fullpaths))
          return true;
      }
      return false;
    }
    childrenIgnored(p) {
      const fullpath = p.fullpath() + "/";
      const relative = (p.relative() || ".") + "/";
      for (const m of this.relativeChildren) {
        if (m.match(relative))
          return true;
      }
      for (const m of this.absoluteChildren) {
        if (m.match(fullpath))
          return true;
      }
      return false;
    }
  }
  exports.Ignore = Ignore;
});

// ../../node_modules/.pnpm/glob@10.5.0/node_modules/glob/dist/commonjs/processor.js
var require_processor = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Processor = exports.SubWalks = exports.MatchRecord = exports.HasWalkedCache = undefined;
  var minimatch_1 = require_commonjs();

  class HasWalkedCache {
    store;
    constructor(store = new Map) {
      this.store = store;
    }
    copy() {
      return new HasWalkedCache(new Map(this.store));
    }
    hasWalked(target, pattern) {
      return this.store.get(target.fullpath())?.has(pattern.globString());
    }
    storeWalked(target, pattern) {
      const fullpath = target.fullpath();
      const cached = this.store.get(fullpath);
      if (cached)
        cached.add(pattern.globString());
      else
        this.store.set(fullpath, new Set([pattern.globString()]));
    }
  }
  exports.HasWalkedCache = HasWalkedCache;

  class MatchRecord {
    store = new Map;
    add(target, absolute, ifDir) {
      const n = (absolute ? 2 : 0) | (ifDir ? 1 : 0);
      const current = this.store.get(target);
      this.store.set(target, current === undefined ? n : n & current);
    }
    entries() {
      return [...this.store.entries()].map(([path, n]) => [
        path,
        !!(n & 2),
        !!(n & 1)
      ]);
    }
  }
  exports.MatchRecord = MatchRecord;

  class SubWalks {
    store = new Map;
    add(target, pattern) {
      if (!target.canReaddir()) {
        return;
      }
      const subs = this.store.get(target);
      if (subs) {
        if (!subs.find((p) => p.globString() === pattern.globString())) {
          subs.push(pattern);
        }
      } else
        this.store.set(target, [pattern]);
    }
    get(target) {
      const subs = this.store.get(target);
      if (!subs) {
        throw new Error("attempting to walk unknown path");
      }
      return subs;
    }
    entries() {
      return this.keys().map((k) => [k, this.store.get(k)]);
    }
    keys() {
      return [...this.store.keys()].filter((t) => t.canReaddir());
    }
  }
  exports.SubWalks = SubWalks;

  class Processor {
    hasWalkedCache;
    matches = new MatchRecord;
    subwalks = new SubWalks;
    patterns;
    follow;
    dot;
    opts;
    constructor(opts, hasWalkedCache) {
      this.opts = opts;
      this.follow = !!opts.follow;
      this.dot = !!opts.dot;
      this.hasWalkedCache = hasWalkedCache ? hasWalkedCache.copy() : new HasWalkedCache;
    }
    processPatterns(target, patterns) {
      this.patterns = patterns;
      const processingSet = patterns.map((p) => [target, p]);
      for (let [t, pattern] of processingSet) {
        this.hasWalkedCache.storeWalked(t, pattern);
        const root = pattern.root();
        const absolute = pattern.isAbsolute() && this.opts.absolute !== false;
        if (root) {
          t = t.resolve(root === "/" && this.opts.root !== undefined ? this.opts.root : root);
          const rest2 = pattern.rest();
          if (!rest2) {
            this.matches.add(t, true, false);
            continue;
          } else {
            pattern = rest2;
          }
        }
        if (t.isENOENT())
          continue;
        let p;
        let rest;
        let changed = false;
        while (typeof (p = pattern.pattern()) === "string" && (rest = pattern.rest())) {
          const c = t.resolve(p);
          t = c;
          pattern = rest;
          changed = true;
        }
        p = pattern.pattern();
        rest = pattern.rest();
        if (changed) {
          if (this.hasWalkedCache.hasWalked(t, pattern))
            continue;
          this.hasWalkedCache.storeWalked(t, pattern);
        }
        if (typeof p === "string") {
          const ifDir = p === ".." || p === "" || p === ".";
          this.matches.add(t.resolve(p), absolute, ifDir);
          continue;
        } else if (p === minimatch_1.GLOBSTAR) {
          if (!t.isSymbolicLink() || this.follow || pattern.checkFollowGlobstar()) {
            this.subwalks.add(t, pattern);
          }
          const rp = rest?.pattern();
          const rrest = rest?.rest();
          if (!rest || (rp === "" || rp === ".") && !rrest) {
            this.matches.add(t, absolute, rp === "" || rp === ".");
          } else {
            if (rp === "..") {
              const tp = t.parent || t;
              if (!rrest)
                this.matches.add(tp, absolute, true);
              else if (!this.hasWalkedCache.hasWalked(tp, rrest)) {
                this.subwalks.add(tp, rrest);
              }
            }
          }
        } else if (p instanceof RegExp) {
          this.subwalks.add(t, pattern);
        }
      }
      return this;
    }
    subwalkTargets() {
      return this.subwalks.keys();
    }
    child() {
      return new Processor(this.opts, this.hasWalkedCache);
    }
    filterEntries(parent, entries) {
      const patterns = this.subwalks.get(parent);
      const results = this.child();
      for (const e of entries) {
        for (const pattern of patterns) {
          const absolute = pattern.isAbsolute();
          const p = pattern.pattern();
          const rest = pattern.rest();
          if (p === minimatch_1.GLOBSTAR) {
            results.testGlobstar(e, pattern, rest, absolute);
          } else if (p instanceof RegExp) {
            results.testRegExp(e, p, rest, absolute);
          } else {
            results.testString(e, p, rest, absolute);
          }
        }
      }
      return results;
    }
    testGlobstar(e, pattern, rest, absolute) {
      if (this.dot || !e.name.startsWith(".")) {
        if (!pattern.hasMore()) {
          this.matches.add(e, absolute, false);
        }
        if (e.canReaddir()) {
          if (this.follow || !e.isSymbolicLink()) {
            this.subwalks.add(e, pattern);
          } else if (e.isSymbolicLink()) {
            if (rest && pattern.checkFollowGlobstar()) {
              this.subwalks.add(e, rest);
            } else if (pattern.markFollowGlobstar()) {
              this.subwalks.add(e, pattern);
            }
          }
        }
      }
      if (rest) {
        const rp = rest.pattern();
        if (typeof rp === "string" && rp !== ".." && rp !== "" && rp !== ".") {
          this.testString(e, rp, rest.rest(), absolute);
        } else if (rp === "..") {
          const ep = e.parent || e;
          this.subwalks.add(ep, rest);
        } else if (rp instanceof RegExp) {
          this.testRegExp(e, rp, rest.rest(), absolute);
        }
      }
    }
    testRegExp(e, p, rest, absolute) {
      if (!p.test(e.name))
        return;
      if (!rest) {
        this.matches.add(e, absolute, false);
      } else {
        this.subwalks.add(e, rest);
      }
    }
    testString(e, p, rest, absolute) {
      if (!e.isNamed(p))
        return;
      if (!rest) {
        this.matches.add(e, absolute, false);
      } else {
        this.subwalks.add(e, rest);
      }
    }
  }
  exports.Processor = Processor;
});

// ../../node_modules/.pnpm/glob@10.5.0/node_modules/glob/dist/commonjs/walker.js
var require_walker = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.GlobStream = exports.GlobWalker = exports.GlobUtil = undefined;
  var minipass_1 = require_commonjs3();
  var ignore_js_1 = require_ignore();
  var processor_js_1 = require_processor();
  var makeIgnore = (ignore, opts) => typeof ignore === "string" ? new ignore_js_1.Ignore([ignore], opts) : Array.isArray(ignore) ? new ignore_js_1.Ignore(ignore, opts) : ignore;

  class GlobUtil {
    path;
    patterns;
    opts;
    seen = new Set;
    paused = false;
    aborted = false;
    #onResume = [];
    #ignore;
    #sep;
    signal;
    maxDepth;
    includeChildMatches;
    constructor(patterns, path, opts) {
      this.patterns = patterns;
      this.path = path;
      this.opts = opts;
      this.#sep = !opts.posix && opts.platform === "win32" ? "\\" : "/";
      this.includeChildMatches = opts.includeChildMatches !== false;
      if (opts.ignore || !this.includeChildMatches) {
        this.#ignore = makeIgnore(opts.ignore ?? [], opts);
        if (!this.includeChildMatches && typeof this.#ignore.add !== "function") {
          const m = "cannot ignore child matches, ignore lacks add() method.";
          throw new Error(m);
        }
      }
      this.maxDepth = opts.maxDepth || Infinity;
      if (opts.signal) {
        this.signal = opts.signal;
        this.signal.addEventListener("abort", () => {
          this.#onResume.length = 0;
        });
      }
    }
    #ignored(path) {
      return this.seen.has(path) || !!this.#ignore?.ignored?.(path);
    }
    #childrenIgnored(path) {
      return !!this.#ignore?.childrenIgnored?.(path);
    }
    pause() {
      this.paused = true;
    }
    resume() {
      if (this.signal?.aborted)
        return;
      this.paused = false;
      let fn = undefined;
      while (!this.paused && (fn = this.#onResume.shift())) {
        fn();
      }
    }
    onResume(fn) {
      if (this.signal?.aborted)
        return;
      if (!this.paused) {
        fn();
      } else {
        this.#onResume.push(fn);
      }
    }
    async matchCheck(e, ifDir) {
      if (ifDir && this.opts.nodir)
        return;
      let rpc;
      if (this.opts.realpath) {
        rpc = e.realpathCached() || await e.realpath();
        if (!rpc)
          return;
        e = rpc;
      }
      const needStat = e.isUnknown() || this.opts.stat;
      const s = needStat ? await e.lstat() : e;
      if (this.opts.follow && this.opts.nodir && s?.isSymbolicLink()) {
        const target = await s.realpath();
        if (target && (target.isUnknown() || this.opts.stat)) {
          await target.lstat();
        }
      }
      return this.matchCheckTest(s, ifDir);
    }
    matchCheckTest(e, ifDir) {
      return e && (this.maxDepth === Infinity || e.depth() <= this.maxDepth) && (!ifDir || e.canReaddir()) && (!this.opts.nodir || !e.isDirectory()) && (!this.opts.nodir || !this.opts.follow || !e.isSymbolicLink() || !e.realpathCached()?.isDirectory()) && !this.#ignored(e) ? e : undefined;
    }
    matchCheckSync(e, ifDir) {
      if (ifDir && this.opts.nodir)
        return;
      let rpc;
      if (this.opts.realpath) {
        rpc = e.realpathCached() || e.realpathSync();
        if (!rpc)
          return;
        e = rpc;
      }
      const needStat = e.isUnknown() || this.opts.stat;
      const s = needStat ? e.lstatSync() : e;
      if (this.opts.follow && this.opts.nodir && s?.isSymbolicLink()) {
        const target = s.realpathSync();
        if (target && (target?.isUnknown() || this.opts.stat)) {
          target.lstatSync();
        }
      }
      return this.matchCheckTest(s, ifDir);
    }
    matchFinish(e, absolute) {
      if (this.#ignored(e))
        return;
      if (!this.includeChildMatches && this.#ignore?.add) {
        const ign = `${e.relativePosix()}/**`;
        this.#ignore.add(ign);
      }
      const abs = this.opts.absolute === undefined ? absolute : this.opts.absolute;
      this.seen.add(e);
      const mark = this.opts.mark && e.isDirectory() ? this.#sep : "";
      if (this.opts.withFileTypes) {
        this.matchEmit(e);
      } else if (abs) {
        const abs2 = this.opts.posix ? e.fullpathPosix() : e.fullpath();
        this.matchEmit(abs2 + mark);
      } else {
        const rel = this.opts.posix ? e.relativePosix() : e.relative();
        const pre = this.opts.dotRelative && !rel.startsWith(".." + this.#sep) ? "." + this.#sep : "";
        this.matchEmit(!rel ? "." + mark : pre + rel + mark);
      }
    }
    async match(e, absolute, ifDir) {
      const p = await this.matchCheck(e, ifDir);
      if (p)
        this.matchFinish(p, absolute);
    }
    matchSync(e, absolute, ifDir) {
      const p = this.matchCheckSync(e, ifDir);
      if (p)
        this.matchFinish(p, absolute);
    }
    walkCB(target, patterns, cb) {
      if (this.signal?.aborted)
        cb();
      this.walkCB2(target, patterns, new processor_js_1.Processor(this.opts), cb);
    }
    walkCB2(target, patterns, processor, cb) {
      if (this.#childrenIgnored(target))
        return cb();
      if (this.signal?.aborted)
        cb();
      if (this.paused) {
        this.onResume(() => this.walkCB2(target, patterns, processor, cb));
        return;
      }
      processor.processPatterns(target, patterns);
      let tasks = 1;
      const next = () => {
        if (--tasks === 0)
          cb();
      };
      for (const [m, absolute, ifDir] of processor.matches.entries()) {
        if (this.#ignored(m))
          continue;
        tasks++;
        this.match(m, absolute, ifDir).then(() => next());
      }
      for (const t of processor.subwalkTargets()) {
        if (this.maxDepth !== Infinity && t.depth() >= this.maxDepth) {
          continue;
        }
        tasks++;
        const childrenCached = t.readdirCached();
        if (t.calledReaddir())
          this.walkCB3(t, childrenCached, processor, next);
        else {
          t.readdirCB((_2, entries) => this.walkCB3(t, entries, processor, next), true);
        }
      }
      next();
    }
    walkCB3(target, entries, processor, cb) {
      processor = processor.filterEntries(target, entries);
      let tasks = 1;
      const next = () => {
        if (--tasks === 0)
          cb();
      };
      for (const [m, absolute, ifDir] of processor.matches.entries()) {
        if (this.#ignored(m))
          continue;
        tasks++;
        this.match(m, absolute, ifDir).then(() => next());
      }
      for (const [target2, patterns] of processor.subwalks.entries()) {
        tasks++;
        this.walkCB2(target2, patterns, processor.child(), next);
      }
      next();
    }
    walkCBSync(target, patterns, cb) {
      if (this.signal?.aborted)
        cb();
      this.walkCB2Sync(target, patterns, new processor_js_1.Processor(this.opts), cb);
    }
    walkCB2Sync(target, patterns, processor, cb) {
      if (this.#childrenIgnored(target))
        return cb();
      if (this.signal?.aborted)
        cb();
      if (this.paused) {
        this.onResume(() => this.walkCB2Sync(target, patterns, processor, cb));
        return;
      }
      processor.processPatterns(target, patterns);
      let tasks = 1;
      const next = () => {
        if (--tasks === 0)
          cb();
      };
      for (const [m, absolute, ifDir] of processor.matches.entries()) {
        if (this.#ignored(m))
          continue;
        this.matchSync(m, absolute, ifDir);
      }
      for (const t of processor.subwalkTargets()) {
        if (this.maxDepth !== Infinity && t.depth() >= this.maxDepth) {
          continue;
        }
        tasks++;
        const children = t.readdirSync();
        this.walkCB3Sync(t, children, processor, next);
      }
      next();
    }
    walkCB3Sync(target, entries, processor, cb) {
      processor = processor.filterEntries(target, entries);
      let tasks = 1;
      const next = () => {
        if (--tasks === 0)
          cb();
      };
      for (const [m, absolute, ifDir] of processor.matches.entries()) {
        if (this.#ignored(m))
          continue;
        this.matchSync(m, absolute, ifDir);
      }
      for (const [target2, patterns] of processor.subwalks.entries()) {
        tasks++;
        this.walkCB2Sync(target2, patterns, processor.child(), next);
      }
      next();
    }
  }
  exports.GlobUtil = GlobUtil;

  class GlobWalker extends GlobUtil {
    matches = new Set;
    constructor(patterns, path, opts) {
      super(patterns, path, opts);
    }
    matchEmit(e) {
      this.matches.add(e);
    }
    async walk() {
      if (this.signal?.aborted)
        throw this.signal.reason;
      if (this.path.isUnknown()) {
        await this.path.lstat();
      }
      await new Promise((res, rej) => {
        this.walkCB(this.path, this.patterns, () => {
          if (this.signal?.aborted) {
            rej(this.signal.reason);
          } else {
            res(this.matches);
          }
        });
      });
      return this.matches;
    }
    walkSync() {
      if (this.signal?.aborted)
        throw this.signal.reason;
      if (this.path.isUnknown()) {
        this.path.lstatSync();
      }
      this.walkCBSync(this.path, this.patterns, () => {
        if (this.signal?.aborted)
          throw this.signal.reason;
      });
      return this.matches;
    }
  }
  exports.GlobWalker = GlobWalker;

  class GlobStream extends GlobUtil {
    results;
    constructor(patterns, path, opts) {
      super(patterns, path, opts);
      this.results = new minipass_1.Minipass({
        signal: this.signal,
        objectMode: true
      });
      this.results.on("drain", () => this.resume());
      this.results.on("resume", () => this.resume());
    }
    matchEmit(e) {
      this.results.write(e);
      if (!this.results.flowing)
        this.pause();
    }
    stream() {
      const target = this.path;
      if (target.isUnknown()) {
        target.lstat().then(() => {
          this.walkCB(target, this.patterns, () => this.results.end());
        });
      } else {
        this.walkCB(target, this.patterns, () => this.results.end());
      }
      return this.results;
    }
    streamSync() {
      if (this.path.isUnknown()) {
        this.path.lstatSync();
      }
      this.walkCBSync(this.path, this.patterns, () => this.results.end());
      return this.results;
    }
  }
  exports.GlobStream = GlobStream;
});

// ../../node_modules/.pnpm/glob@10.5.0/node_modules/glob/dist/commonjs/glob.js
var require_glob = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Glob = undefined;
  var minimatch_1 = require_commonjs();
  var node_url_1 = __require("node:url");
  var path_scurry_1 = require_commonjs4();
  var pattern_js_1 = require_pattern();
  var walker_js_1 = require_walker();
  var defaultPlatform = typeof process === "object" && process && typeof process.platform === "string" ? process.platform : "linux";

  class Glob {
    absolute;
    cwd;
    root;
    dot;
    dotRelative;
    follow;
    ignore;
    magicalBraces;
    mark;
    matchBase;
    maxDepth;
    nobrace;
    nocase;
    nodir;
    noext;
    noglobstar;
    pattern;
    platform;
    realpath;
    scurry;
    stat;
    signal;
    windowsPathsNoEscape;
    withFileTypes;
    includeChildMatches;
    opts;
    patterns;
    constructor(pattern, opts) {
      if (!opts)
        throw new TypeError("glob options required");
      this.withFileTypes = !!opts.withFileTypes;
      this.signal = opts.signal;
      this.follow = !!opts.follow;
      this.dot = !!opts.dot;
      this.dotRelative = !!opts.dotRelative;
      this.nodir = !!opts.nodir;
      this.mark = !!opts.mark;
      if (!opts.cwd) {
        this.cwd = "";
      } else if (opts.cwd instanceof URL || opts.cwd.startsWith("file://")) {
        opts.cwd = (0, node_url_1.fileURLToPath)(opts.cwd);
      }
      this.cwd = opts.cwd || "";
      this.root = opts.root;
      this.magicalBraces = !!opts.magicalBraces;
      this.nobrace = !!opts.nobrace;
      this.noext = !!opts.noext;
      this.realpath = !!opts.realpath;
      this.absolute = opts.absolute;
      this.includeChildMatches = opts.includeChildMatches !== false;
      this.noglobstar = !!opts.noglobstar;
      this.matchBase = !!opts.matchBase;
      this.maxDepth = typeof opts.maxDepth === "number" ? opts.maxDepth : Infinity;
      this.stat = !!opts.stat;
      this.ignore = opts.ignore;
      if (this.withFileTypes && this.absolute !== undefined) {
        throw new Error("cannot set absolute and withFileTypes:true");
      }
      if (typeof pattern === "string") {
        pattern = [pattern];
      }
      this.windowsPathsNoEscape = !!opts.windowsPathsNoEscape || opts.allowWindowsEscape === false;
      if (this.windowsPathsNoEscape) {
        pattern = pattern.map((p) => p.replace(/\\/g, "/"));
      }
      if (this.matchBase) {
        if (opts.noglobstar) {
          throw new TypeError("base matching requires globstar");
        }
        pattern = pattern.map((p) => p.includes("/") ? p : `./**/${p}`);
      }
      this.pattern = pattern;
      this.platform = opts.platform || defaultPlatform;
      this.opts = { ...opts, platform: this.platform };
      if (opts.scurry) {
        this.scurry = opts.scurry;
        if (opts.nocase !== undefined && opts.nocase !== opts.scurry.nocase) {
          throw new Error("nocase option contradicts provided scurry option");
        }
      } else {
        const Scurry = opts.platform === "win32" ? path_scurry_1.PathScurryWin32 : opts.platform === "darwin" ? path_scurry_1.PathScurryDarwin : opts.platform ? path_scurry_1.PathScurryPosix : path_scurry_1.PathScurry;
        this.scurry = new Scurry(this.cwd, {
          nocase: opts.nocase,
          fs: opts.fs
        });
      }
      this.nocase = this.scurry.nocase;
      const nocaseMagicOnly = this.platform === "darwin" || this.platform === "win32";
      const mmo = {
        ...opts,
        dot: this.dot,
        matchBase: this.matchBase,
        nobrace: this.nobrace,
        nocase: this.nocase,
        nocaseMagicOnly,
        nocomment: true,
        noext: this.noext,
        nonegate: true,
        optimizationLevel: 2,
        platform: this.platform,
        windowsPathsNoEscape: this.windowsPathsNoEscape,
        debug: !!this.opts.debug
      };
      const mms = this.pattern.map((p) => new minimatch_1.Minimatch(p, mmo));
      const [matchSet, globParts] = mms.reduce((set, m) => {
        set[0].push(...m.set);
        set[1].push(...m.globParts);
        return set;
      }, [[], []]);
      this.patterns = matchSet.map((set, i) => {
        const g = globParts[i];
        if (!g)
          throw new Error("invalid pattern object");
        return new pattern_js_1.Pattern(set, g, 0, this.platform);
      });
    }
    async walk() {
      return [
        ...await new walker_js_1.GlobWalker(this.patterns, this.scurry.cwd, {
          ...this.opts,
          maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
          platform: this.platform,
          nocase: this.nocase,
          includeChildMatches: this.includeChildMatches
        }).walk()
      ];
    }
    walkSync() {
      return [
        ...new walker_js_1.GlobWalker(this.patterns, this.scurry.cwd, {
          ...this.opts,
          maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
          platform: this.platform,
          nocase: this.nocase,
          includeChildMatches: this.includeChildMatches
        }).walkSync()
      ];
    }
    stream() {
      return new walker_js_1.GlobStream(this.patterns, this.scurry.cwd, {
        ...this.opts,
        maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
        platform: this.platform,
        nocase: this.nocase,
        includeChildMatches: this.includeChildMatches
      }).stream();
    }
    streamSync() {
      return new walker_js_1.GlobStream(this.patterns, this.scurry.cwd, {
        ...this.opts,
        maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
        platform: this.platform,
        nocase: this.nocase,
        includeChildMatches: this.includeChildMatches
      }).streamSync();
    }
    iterateSync() {
      return this.streamSync()[Symbol.iterator]();
    }
    [Symbol.iterator]() {
      return this.iterateSync();
    }
    iterate() {
      return this.stream()[Symbol.asyncIterator]();
    }
    [Symbol.asyncIterator]() {
      return this.iterate();
    }
  }
  exports.Glob = Glob;
});

// ../../node_modules/.pnpm/glob@10.5.0/node_modules/glob/dist/commonjs/has-magic.js
var require_has_magic = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.hasMagic = undefined;
  var minimatch_1 = require_commonjs();
  var hasMagic = (pattern, options = {}) => {
    if (!Array.isArray(pattern)) {
      pattern = [pattern];
    }
    for (const p of pattern) {
      if (new minimatch_1.Minimatch(p, options).hasMagic())
        return true;
    }
    return false;
  };
  exports.hasMagic = hasMagic;
});

// ../../node_modules/.pnpm/glob@10.5.0/node_modules/glob/dist/commonjs/index.js
var require_commonjs5 = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.glob = exports.sync = exports.iterate = exports.iterateSync = exports.stream = exports.streamSync = exports.Ignore = exports.hasMagic = exports.Glob = exports.unescape = exports.escape = undefined;
  exports.globStreamSync = globStreamSync;
  exports.globStream = globStream;
  exports.globSync = globSync;
  exports.globIterateSync = globIterateSync;
  exports.globIterate = globIterate;
  var minimatch_1 = require_commonjs();
  var glob_js_1 = require_glob();
  var has_magic_js_1 = require_has_magic();
  var minimatch_2 = require_commonjs();
  Object.defineProperty(exports, "escape", { enumerable: true, get: function() {
    return minimatch_2.escape;
  } });
  Object.defineProperty(exports, "unescape", { enumerable: true, get: function() {
    return minimatch_2.unescape;
  } });
  var glob_js_2 = require_glob();
  Object.defineProperty(exports, "Glob", { enumerable: true, get: function() {
    return glob_js_2.Glob;
  } });
  var has_magic_js_2 = require_has_magic();
  Object.defineProperty(exports, "hasMagic", { enumerable: true, get: function() {
    return has_magic_js_2.hasMagic;
  } });
  var ignore_js_1 = require_ignore();
  Object.defineProperty(exports, "Ignore", { enumerable: true, get: function() {
    return ignore_js_1.Ignore;
  } });
  function globStreamSync(pattern, options = {}) {
    return new glob_js_1.Glob(pattern, options).streamSync();
  }
  function globStream(pattern, options = {}) {
    return new glob_js_1.Glob(pattern, options).stream();
  }
  function globSync(pattern, options = {}) {
    return new glob_js_1.Glob(pattern, options).walkSync();
  }
  async function glob_(pattern, options = {}) {
    return new glob_js_1.Glob(pattern, options).walk();
  }
  function globIterateSync(pattern, options = {}) {
    return new glob_js_1.Glob(pattern, options).iterateSync();
  }
  function globIterate(pattern, options = {}) {
    return new glob_js_1.Glob(pattern, options).iterate();
  }
  exports.streamSync = globStreamSync;
  exports.stream = Object.assign(globStream, { sync: globStreamSync });
  exports.iterateSync = globIterateSync;
  exports.iterate = Object.assign(globIterate, {
    sync: globIterateSync
  });
  exports.sync = Object.assign(globSync, {
    stream: globStreamSync,
    iterate: globIterateSync
  });
  exports.glob = Object.assign(glob_, {
    glob: glob_,
    globSync,
    sync: exports.sync,
    globStream,
    stream: exports.stream,
    globStreamSync,
    streamSync: exports.streamSync,
    globIterate,
    iterate: exports.iterate,
    globIterateSync,
    iterateSync: exports.iterateSync,
    Glob: glob_js_1.Glob,
    hasMagic: has_magic_js_1.hasMagic,
    escape: minimatch_1.escape,
    unescape: minimatch_1.unescape
  });
  exports.glob.glob = exports.glob;
});

// ../../node_modules/.pnpm/archiver-utils@5.0.2/node_modules/archiver-utils/file.js
var require_file = __commonJS((exports, module) => {
  var fs = require_graceful_fs();
  var path = __require("path");
  var flatten = require_flatten();
  var difference = require_difference();
  var union = require_union();
  var isPlainObject = require_isPlainObject();
  var glob = require_commonjs5();
  var file = module.exports = {};
  var pathSeparatorRe = /[\/\\]/g;
  var processPatterns = function(patterns, fn) {
    var result = [];
    flatten(patterns).forEach(function(pattern) {
      var exclusion = pattern.indexOf("!") === 0;
      if (exclusion) {
        pattern = pattern.slice(1);
      }
      var matches = fn(pattern);
      if (exclusion) {
        result = difference(result, matches);
      } else {
        result = union(result, matches);
      }
    });
    return result;
  };
  file.exists = function() {
    var filepath = path.join.apply(path, arguments);
    return fs.existsSync(filepath);
  };
  file.expand = function(...args) {
    var options = isPlainObject(args[0]) ? args.shift() : {};
    var patterns = Array.isArray(args[0]) ? args[0] : args;
    if (patterns.length === 0) {
      return [];
    }
    var matches = processPatterns(patterns, function(pattern) {
      return glob.sync(pattern, options);
    });
    if (options.filter) {
      matches = matches.filter(function(filepath) {
        filepath = path.join(options.cwd || "", filepath);
        try {
          if (typeof options.filter === "function") {
            return options.filter(filepath);
          } else {
            return fs.statSync(filepath)[options.filter]();
          }
        } catch (e) {
          return false;
        }
      });
    }
    return matches;
  };
  file.expandMapping = function(patterns, destBase, options) {
    options = Object.assign({
      rename: function(destBase2, destPath) {
        return path.join(destBase2 || "", destPath);
      }
    }, options);
    var files = [];
    var fileByDest = {};
    file.expand(options, patterns).forEach(function(src) {
      var destPath = src;
      if (options.flatten) {
        destPath = path.basename(destPath);
      }
      if (options.ext) {
        destPath = destPath.replace(/(\.[^\/]*)?$/, options.ext);
      }
      var dest = options.rename(destBase, destPath, options);
      if (options.cwd) {
        src = path.join(options.cwd, src);
      }
      dest = dest.replace(pathSeparatorRe, "/");
      src = src.replace(pathSeparatorRe, "/");
      if (fileByDest[dest]) {
        fileByDest[dest].src.push(src);
      } else {
        files.push({
          src: [src],
          dest
        });
        fileByDest[dest] = files[files.length - 1];
      }
    });
    return files;
  };
  file.normalizeFilesArray = function(data) {
    var files = [];
    data.forEach(function(obj) {
      var prop;
      if ("src" in obj || "dest" in obj) {
        files.push(obj);
      }
    });
    if (files.length === 0) {
      return [];
    }
    files = _(files).chain().forEach(function(obj) {
      if (!("src" in obj) || !obj.src) {
        return;
      }
      if (Array.isArray(obj.src)) {
        obj.src = flatten(obj.src);
      } else {
        obj.src = [obj.src];
      }
    }).map(function(obj) {
      var expandOptions = Object.assign({}, obj);
      delete expandOptions.src;
      delete expandOptions.dest;
      if (obj.expand) {
        return file.expandMapping(obj.src, obj.dest, expandOptions).map(function(mapObj) {
          var result2 = Object.assign({}, obj);
          result2.orig = Object.assign({}, obj);
          result2.src = mapObj.src;
          result2.dest = mapObj.dest;
          ["expand", "cwd", "flatten", "rename", "ext"].forEach(function(prop) {
            delete result2[prop];
          });
          return result2;
        });
      }
      var result = Object.assign({}, obj);
      result.orig = Object.assign({}, obj);
      if ("src" in result) {
        Object.defineProperty(result, "src", {
          enumerable: true,
          get: function fn() {
            var src;
            if (!("result" in fn)) {
              src = obj.src;
              src = Array.isArray(src) ? flatten(src) : [src];
              fn.result = file.expand(expandOptions, src);
            }
            return fn.result;
          }
        });
      }
      if ("dest" in result) {
        result.dest = obj.dest;
      }
      return result;
    }).flatten().value();
    return files;
  };
});

// ../../node_modules/.pnpm/archiver-utils@5.0.2/node_modules/archiver-utils/index.js
var require_archiver_utils = __commonJS((exports, module) => {
  var fs = require_graceful_fs();
  var path = __require("path");
  var isStream = require_is_stream();
  var lazystream = require_lazystream();
  var normalizePath = require_normalize_path();
  var defaults = require_defaults();
  var Stream = __require("stream").Stream;
  var PassThrough = require_ours().PassThrough;
  var utils = module.exports = {};
  utils.file = require_file();
  utils.collectStream = function(source, callback) {
    var collection = [];
    var size = 0;
    source.on("error", callback);
    source.on("data", function(chunk) {
      collection.push(chunk);
      size += chunk.length;
    });
    source.on("end", function() {
      var buf = Buffer.alloc(size);
      var offset = 0;
      collection.forEach(function(data) {
        data.copy(buf, offset);
        offset += data.length;
      });
      callback(null, buf);
    });
  };
  utils.dateify = function(dateish) {
    dateish = dateish || new Date;
    if (dateish instanceof Date) {
      dateish = dateish;
    } else if (typeof dateish === "string") {
      dateish = new Date(dateish);
    } else {
      dateish = new Date;
    }
    return dateish;
  };
  utils.defaults = function(object, source, guard) {
    var args = arguments;
    args[0] = args[0] || {};
    return defaults(...args);
  };
  utils.isStream = function(source) {
    return isStream(source);
  };
  utils.lazyReadStream = function(filepath) {
    return new lazystream.Readable(function() {
      return fs.createReadStream(filepath);
    });
  };
  utils.normalizeInputSource = function(source) {
    if (source === null) {
      return Buffer.alloc(0);
    } else if (typeof source === "string") {
      return Buffer.from(source);
    } else if (utils.isStream(source)) {
      return source.pipe(new PassThrough);
    }
    return source;
  };
  utils.sanitizePath = function(filepath) {
    return normalizePath(filepath, false).replace(/^\w+:/, "").replace(/^(\.\.\/|\/)+/, "");
  };
  utils.trailingSlashIt = function(str) {
    return str.slice(-1) !== "/" ? str + "/" : str;
  };
  utils.unixifyPath = function(filepath) {
    return normalizePath(filepath, false).replace(/^\w+:/, "");
  };
  utils.walkdir = function(dirpath, base, callback) {
    var results = [];
    if (typeof base === "function") {
      callback = base;
      base = dirpath;
    }
    fs.readdir(dirpath, function(err, list) {
      var i = 0;
      var file;
      var filepath;
      if (err) {
        return callback(err);
      }
      (function next() {
        file = list[i++];
        if (!file) {
          return callback(null, results);
        }
        filepath = path.join(dirpath, file);
        fs.stat(filepath, function(err2, stats) {
          results.push({
            path: filepath,
            relative: path.relative(base, filepath).replace(/\\/g, "/"),
            stats
          });
          if (stats && stats.isDirectory()) {
            utils.walkdir(filepath, base, function(err3, res) {
              if (err3) {
                return callback(err3);
              }
              res.forEach(function(dirEntry) {
                results.push(dirEntry);
              });
              next();
            });
          } else {
            next();
          }
        });
      })();
    });
  };
});

// ../../node_modules/.pnpm/archiver@7.0.1/node_modules/archiver/lib/error.js
var require_error2 = __commonJS((exports, module) => {
  var util = __require("util");
  var ERROR_CODES = {
    ABORTED: "archive was aborted",
    DIRECTORYDIRPATHREQUIRED: "diretory dirpath argument must be a non-empty string value",
    DIRECTORYFUNCTIONINVALIDDATA: "invalid data returned by directory custom data function",
    ENTRYNAMEREQUIRED: "entry name must be a non-empty string value",
    FILEFILEPATHREQUIRED: "file filepath argument must be a non-empty string value",
    FINALIZING: "archive already finalizing",
    QUEUECLOSED: "queue closed",
    NOENDMETHOD: "no suitable finalize/end method defined by module",
    DIRECTORYNOTSUPPORTED: "support for directory entries not defined by module",
    FORMATSET: "archive format already set",
    INPUTSTEAMBUFFERREQUIRED: "input source must be valid Stream or Buffer instance",
    MODULESET: "module already set",
    SYMLINKNOTSUPPORTED: "support for symlink entries not defined by module",
    SYMLINKFILEPATHREQUIRED: "symlink filepath argument must be a non-empty string value",
    SYMLINKTARGETREQUIRED: "symlink target argument must be a non-empty string value",
    ENTRYNOTSUPPORTED: "entry not supported"
  };
  function ArchiverError(code, data) {
    Error.captureStackTrace(this, this.constructor);
    this.message = ERROR_CODES[code] || code;
    this.code = code;
    this.data = data;
  }
  util.inherits(ArchiverError, Error);
  exports = module.exports = ArchiverError;
});

// ../../node_modules/.pnpm/archiver@7.0.1/node_modules/archiver/lib/core.js
var require_core = __commonJS((exports, module) => {
  var fs = __require("fs");
  var glob = require_readdir_glob();
  var async = require_async();
  var path = __require("path");
  var util = require_archiver_utils();
  var inherits = __require("util").inherits;
  var ArchiverError = require_error2();
  var Transform = require_ours().Transform;
  var win32 = process.platform === "win32";
  var Archiver = function(format, options) {
    if (!(this instanceof Archiver)) {
      return new Archiver(format, options);
    }
    if (typeof format !== "string") {
      options = format;
      format = "zip";
    }
    options = this.options = util.defaults(options, {
      highWaterMark: 1024 * 1024,
      statConcurrency: 4
    });
    Transform.call(this, options);
    this._format = false;
    this._module = false;
    this._pending = 0;
    this._pointer = 0;
    this._entriesCount = 0;
    this._entriesProcessedCount = 0;
    this._fsEntriesTotalBytes = 0;
    this._fsEntriesProcessedBytes = 0;
    this._queue = async.queue(this._onQueueTask.bind(this), 1);
    this._queue.drain(this._onQueueDrain.bind(this));
    this._statQueue = async.queue(this._onStatQueueTask.bind(this), options.statConcurrency);
    this._statQueue.drain(this._onQueueDrain.bind(this));
    this._state = {
      aborted: false,
      finalize: false,
      finalizing: false,
      finalized: false,
      modulePiped: false
    };
    this._streams = [];
  };
  inherits(Archiver, Transform);
  Archiver.prototype._abort = function() {
    this._state.aborted = true;
    this._queue.kill();
    this._statQueue.kill();
    if (this._queue.idle()) {
      this._shutdown();
    }
  };
  Archiver.prototype._append = function(filepath, data) {
    data = data || {};
    var task = {
      source: null,
      filepath
    };
    if (!data.name) {
      data.name = filepath;
    }
    data.sourcePath = filepath;
    task.data = data;
    this._entriesCount++;
    if (data.stats && data.stats instanceof fs.Stats) {
      task = this._updateQueueTaskWithStats(task, data.stats);
      if (task) {
        if (data.stats.size) {
          this._fsEntriesTotalBytes += data.stats.size;
        }
        this._queue.push(task);
      }
    } else {
      this._statQueue.push(task);
    }
  };
  Archiver.prototype._finalize = function() {
    if (this._state.finalizing || this._state.finalized || this._state.aborted) {
      return;
    }
    this._state.finalizing = true;
    this._moduleFinalize();
    this._state.finalizing = false;
    this._state.finalized = true;
  };
  Archiver.prototype._maybeFinalize = function() {
    if (this._state.finalizing || this._state.finalized || this._state.aborted) {
      return false;
    }
    if (this._state.finalize && this._pending === 0 && this._queue.idle() && this._statQueue.idle()) {
      this._finalize();
      return true;
    }
    return false;
  };
  Archiver.prototype._moduleAppend = function(source, data, callback) {
    if (this._state.aborted) {
      callback();
      return;
    }
    this._module.append(source, data, function(err) {
      this._task = null;
      if (this._state.aborted) {
        this._shutdown();
        return;
      }
      if (err) {
        this.emit("error", err);
        setImmediate(callback);
        return;
      }
      this.emit("entry", data);
      this._entriesProcessedCount++;
      if (data.stats && data.stats.size) {
        this._fsEntriesProcessedBytes += data.stats.size;
      }
      this.emit("progress", {
        entries: {
          total: this._entriesCount,
          processed: this._entriesProcessedCount
        },
        fs: {
          totalBytes: this._fsEntriesTotalBytes,
          processedBytes: this._fsEntriesProcessedBytes
        }
      });
      setImmediate(callback);
    }.bind(this));
  };
  Archiver.prototype._moduleFinalize = function() {
    if (typeof this._module.finalize === "function") {
      this._module.finalize();
    } else if (typeof this._module.end === "function") {
      this._module.end();
    } else {
      this.emit("error", new ArchiverError("NOENDMETHOD"));
    }
  };
  Archiver.prototype._modulePipe = function() {
    this._module.on("error", this._onModuleError.bind(this));
    this._module.pipe(this);
    this._state.modulePiped = true;
  };
  Archiver.prototype._moduleSupports = function(key) {
    if (!this._module.supports || !this._module.supports[key]) {
      return false;
    }
    return this._module.supports[key];
  };
  Archiver.prototype._moduleUnpipe = function() {
    this._module.unpipe(this);
    this._state.modulePiped = false;
  };
  Archiver.prototype._normalizeEntryData = function(data, stats) {
    data = util.defaults(data, {
      type: "file",
      name: null,
      date: null,
      mode: null,
      prefix: null,
      sourcePath: null,
      stats: false
    });
    if (stats && data.stats === false) {
      data.stats = stats;
    }
    var isDir = data.type === "directory";
    if (data.name) {
      if (typeof data.prefix === "string" && data.prefix !== "") {
        data.name = data.prefix + "/" + data.name;
        data.prefix = null;
      }
      data.name = util.sanitizePath(data.name);
      if (data.type !== "symlink" && data.name.slice(-1) === "/") {
        isDir = true;
        data.type = "directory";
      } else if (isDir) {
        data.name += "/";
      }
    }
    if (typeof data.mode === "number") {
      if (win32) {
        data.mode &= 511;
      } else {
        data.mode &= 4095;
      }
    } else if (data.stats && data.mode === null) {
      if (win32) {
        data.mode = data.stats.mode & 511;
      } else {
        data.mode = data.stats.mode & 4095;
      }
      if (win32 && isDir) {
        data.mode = 493;
      }
    } else if (data.mode === null) {
      data.mode = isDir ? 493 : 420;
    }
    if (data.stats && data.date === null) {
      data.date = data.stats.mtime;
    } else {
      data.date = util.dateify(data.date);
    }
    return data;
  };
  Archiver.prototype._onModuleError = function(err) {
    this.emit("error", err);
  };
  Archiver.prototype._onQueueDrain = function() {
    if (this._state.finalizing || this._state.finalized || this._state.aborted) {
      return;
    }
    if (this._state.finalize && this._pending === 0 && this._queue.idle() && this._statQueue.idle()) {
      this._finalize();
    }
  };
  Archiver.prototype._onQueueTask = function(task, callback) {
    var fullCallback = () => {
      if (task.data.callback) {
        task.data.callback();
      }
      callback();
    };
    if (this._state.finalizing || this._state.finalized || this._state.aborted) {
      fullCallback();
      return;
    }
    this._task = task;
    this._moduleAppend(task.source, task.data, fullCallback);
  };
  Archiver.prototype._onStatQueueTask = function(task, callback) {
    if (this._state.finalizing || this._state.finalized || this._state.aborted) {
      callback();
      return;
    }
    fs.lstat(task.filepath, function(err, stats) {
      if (this._state.aborted) {
        setImmediate(callback);
        return;
      }
      if (err) {
        this._entriesCount--;
        this.emit("warning", err);
        setImmediate(callback);
        return;
      }
      task = this._updateQueueTaskWithStats(task, stats);
      if (task) {
        if (stats.size) {
          this._fsEntriesTotalBytes += stats.size;
        }
        this._queue.push(task);
      }
      setImmediate(callback);
    }.bind(this));
  };
  Archiver.prototype._shutdown = function() {
    this._moduleUnpipe();
    this.end();
  };
  Archiver.prototype._transform = function(chunk, encoding, callback) {
    if (chunk) {
      this._pointer += chunk.length;
    }
    callback(null, chunk);
  };
  Archiver.prototype._updateQueueTaskWithStats = function(task, stats) {
    if (stats.isFile()) {
      task.data.type = "file";
      task.data.sourceType = "stream";
      task.source = util.lazyReadStream(task.filepath);
    } else if (stats.isDirectory() && this._moduleSupports("directory")) {
      task.data.name = util.trailingSlashIt(task.data.name);
      task.data.type = "directory";
      task.data.sourcePath = util.trailingSlashIt(task.filepath);
      task.data.sourceType = "buffer";
      task.source = Buffer.concat([]);
    } else if (stats.isSymbolicLink() && this._moduleSupports("symlink")) {
      var linkPath = fs.readlinkSync(task.filepath);
      var dirName = path.dirname(task.filepath);
      task.data.type = "symlink";
      task.data.linkname = path.relative(dirName, path.resolve(dirName, linkPath));
      task.data.sourceType = "buffer";
      task.source = Buffer.concat([]);
    } else {
      if (stats.isDirectory()) {
        this.emit("warning", new ArchiverError("DIRECTORYNOTSUPPORTED", task.data));
      } else if (stats.isSymbolicLink()) {
        this.emit("warning", new ArchiverError("SYMLINKNOTSUPPORTED", task.data));
      } else {
        this.emit("warning", new ArchiverError("ENTRYNOTSUPPORTED", task.data));
      }
      return null;
    }
    task.data = this._normalizeEntryData(task.data, stats);
    return task;
  };
  Archiver.prototype.abort = function() {
    if (this._state.aborted || this._state.finalized) {
      return this;
    }
    this._abort();
    return this;
  };
  Archiver.prototype.append = function(source, data) {
    if (this._state.finalize || this._state.aborted) {
      this.emit("error", new ArchiverError("QUEUECLOSED"));
      return this;
    }
    data = this._normalizeEntryData(data);
    if (typeof data.name !== "string" || data.name.length === 0) {
      this.emit("error", new ArchiverError("ENTRYNAMEREQUIRED"));
      return this;
    }
    if (data.type === "directory" && !this._moduleSupports("directory")) {
      this.emit("error", new ArchiverError("DIRECTORYNOTSUPPORTED", { name: data.name }));
      return this;
    }
    source = util.normalizeInputSource(source);
    if (Buffer.isBuffer(source)) {
      data.sourceType = "buffer";
    } else if (util.isStream(source)) {
      data.sourceType = "stream";
    } else {
      this.emit("error", new ArchiverError("INPUTSTEAMBUFFERREQUIRED", { name: data.name }));
      return this;
    }
    this._entriesCount++;
    this._queue.push({
      data,
      source
    });
    return this;
  };
  Archiver.prototype.directory = function(dirpath, destpath, data) {
    if (this._state.finalize || this._state.aborted) {
      this.emit("error", new ArchiverError("QUEUECLOSED"));
      return this;
    }
    if (typeof dirpath !== "string" || dirpath.length === 0) {
      this.emit("error", new ArchiverError("DIRECTORYDIRPATHREQUIRED"));
      return this;
    }
    this._pending++;
    if (destpath === false) {
      destpath = "";
    } else if (typeof destpath !== "string") {
      destpath = dirpath;
    }
    var dataFunction = false;
    if (typeof data === "function") {
      dataFunction = data;
      data = {};
    } else if (typeof data !== "object") {
      data = {};
    }
    var globOptions = {
      stat: true,
      dot: true
    };
    function onGlobEnd() {
      this._pending--;
      this._maybeFinalize();
    }
    function onGlobError(err) {
      this.emit("error", err);
    }
    function onGlobMatch(match) {
      globber.pause();
      var ignoreMatch = false;
      var entryData = Object.assign({}, data);
      entryData.name = match.relative;
      entryData.prefix = destpath;
      entryData.stats = match.stat;
      entryData.callback = globber.resume.bind(globber);
      try {
        if (dataFunction) {
          entryData = dataFunction(entryData);
          if (entryData === false) {
            ignoreMatch = true;
          } else if (typeof entryData !== "object") {
            throw new ArchiverError("DIRECTORYFUNCTIONINVALIDDATA", { dirpath });
          }
        }
      } catch (e) {
        this.emit("error", e);
        return;
      }
      if (ignoreMatch) {
        globber.resume();
        return;
      }
      this._append(match.absolute, entryData);
    }
    var globber = glob(dirpath, globOptions);
    globber.on("error", onGlobError.bind(this));
    globber.on("match", onGlobMatch.bind(this));
    globber.on("end", onGlobEnd.bind(this));
    return this;
  };
  Archiver.prototype.file = function(filepath, data) {
    if (this._state.finalize || this._state.aborted) {
      this.emit("error", new ArchiverError("QUEUECLOSED"));
      return this;
    }
    if (typeof filepath !== "string" || filepath.length === 0) {
      this.emit("error", new ArchiverError("FILEFILEPATHREQUIRED"));
      return this;
    }
    this._append(filepath, data);
    return this;
  };
  Archiver.prototype.glob = function(pattern, options, data) {
    this._pending++;
    options = util.defaults(options, {
      stat: true,
      pattern
    });
    function onGlobEnd() {
      this._pending--;
      this._maybeFinalize();
    }
    function onGlobError(err) {
      this.emit("error", err);
    }
    function onGlobMatch(match) {
      globber.pause();
      var entryData = Object.assign({}, data);
      entryData.callback = globber.resume.bind(globber);
      entryData.stats = match.stat;
      entryData.name = match.relative;
      this._append(match.absolute, entryData);
    }
    var globber = glob(options.cwd || ".", options);
    globber.on("error", onGlobError.bind(this));
    globber.on("match", onGlobMatch.bind(this));
    globber.on("end", onGlobEnd.bind(this));
    return this;
  };
  Archiver.prototype.finalize = function() {
    if (this._state.aborted) {
      var abortedError = new ArchiverError("ABORTED");
      this.emit("error", abortedError);
      return Promise.reject(abortedError);
    }
    if (this._state.finalize) {
      var finalizingError = new ArchiverError("FINALIZING");
      this.emit("error", finalizingError);
      return Promise.reject(finalizingError);
    }
    this._state.finalize = true;
    if (this._pending === 0 && this._queue.idle() && this._statQueue.idle()) {
      this._finalize();
    }
    var self2 = this;
    return new Promise(function(resolve, reject) {
      var errored;
      self2._module.on("end", function() {
        if (!errored) {
          resolve();
        }
      });
      self2._module.on("error", function(err) {
        errored = true;
        reject(err);
      });
    });
  };
  Archiver.prototype.setFormat = function(format) {
    if (this._format) {
      this.emit("error", new ArchiverError("FORMATSET"));
      return this;
    }
    this._format = format;
    return this;
  };
  Archiver.prototype.setModule = function(module2) {
    if (this._state.aborted) {
      this.emit("error", new ArchiverError("ABORTED"));
      return this;
    }
    if (this._state.module) {
      this.emit("error", new ArchiverError("MODULESET"));
      return this;
    }
    this._module = module2;
    this._modulePipe();
    return this;
  };
  Archiver.prototype.symlink = function(filepath, target, mode) {
    if (this._state.finalize || this._state.aborted) {
      this.emit("error", new ArchiverError("QUEUECLOSED"));
      return this;
    }
    if (typeof filepath !== "string" || filepath.length === 0) {
      this.emit("error", new ArchiverError("SYMLINKFILEPATHREQUIRED"));
      return this;
    }
    if (typeof target !== "string" || target.length === 0) {
      this.emit("error", new ArchiverError("SYMLINKTARGETREQUIRED", { filepath }));
      return this;
    }
    if (!this._moduleSupports("symlink")) {
      this.emit("error", new ArchiverError("SYMLINKNOTSUPPORTED", { filepath }));
      return this;
    }
    var data = {};
    data.type = "symlink";
    data.name = filepath.replace(/\\/g, "/");
    data.linkname = target.replace(/\\/g, "/");
    data.sourceType = "buffer";
    if (typeof mode === "number") {
      data.mode = mode;
    }
    this._entriesCount++;
    this._queue.push({
      data,
      source: Buffer.concat([])
    });
    return this;
  };
  Archiver.prototype.pointer = function() {
    return this._pointer;
  };
  Archiver.prototype.use = function(plugin) {
    this._streams.push(plugin);
    return this;
  };
  module.exports = Archiver;
});

// ../../node_modules/.pnpm/compress-commons@6.0.2/node_modules/compress-commons/lib/archivers/archive-entry.js
var require_archive_entry = __commonJS((exports, module) => {
  var ArchiveEntry = module.exports = function() {};
  ArchiveEntry.prototype.getName = function() {};
  ArchiveEntry.prototype.getSize = function() {};
  ArchiveEntry.prototype.getLastModifiedDate = function() {};
  ArchiveEntry.prototype.isDirectory = function() {};
});

// ../../node_modules/.pnpm/compress-commons@6.0.2/node_modules/compress-commons/lib/archivers/zip/util.js
var require_util3 = __commonJS((exports, module) => {
  var util = module.exports = {};
  util.dateToDos = function(d, forceLocalTime) {
    forceLocalTime = forceLocalTime || false;
    var year = forceLocalTime ? d.getFullYear() : d.getUTCFullYear();
    if (year < 1980) {
      return 2162688;
    } else if (year >= 2044) {
      return 2141175677;
    }
    var val = {
      year,
      month: forceLocalTime ? d.getMonth() : d.getUTCMonth(),
      date: forceLocalTime ? d.getDate() : d.getUTCDate(),
      hours: forceLocalTime ? d.getHours() : d.getUTCHours(),
      minutes: forceLocalTime ? d.getMinutes() : d.getUTCMinutes(),
      seconds: forceLocalTime ? d.getSeconds() : d.getUTCSeconds()
    };
    return val.year - 1980 << 25 | val.month + 1 << 21 | val.date << 16 | val.hours << 11 | val.minutes << 5 | val.seconds / 2;
  };
  util.dosToDate = function(dos) {
    return new Date((dos >> 25 & 127) + 1980, (dos >> 21 & 15) - 1, dos >> 16 & 31, dos >> 11 & 31, dos >> 5 & 63, (dos & 31) << 1);
  };
  util.fromDosTime = function(buf) {
    return util.dosToDate(buf.readUInt32LE(0));
  };
  util.getEightBytes = function(v) {
    var buf = Buffer.alloc(8);
    buf.writeUInt32LE(v % 4294967296, 0);
    buf.writeUInt32LE(v / 4294967296 | 0, 4);
    return buf;
  };
  util.getShortBytes = function(v) {
    var buf = Buffer.alloc(2);
    buf.writeUInt16LE((v & 65535) >>> 0, 0);
    return buf;
  };
  util.getShortBytesValue = function(buf, offset) {
    return buf.readUInt16LE(offset);
  };
  util.getLongBytes = function(v) {
    var buf = Buffer.alloc(4);
    buf.writeUInt32LE((v & 4294967295) >>> 0, 0);
    return buf;
  };
  util.getLongBytesValue = function(buf, offset) {
    return buf.readUInt32LE(offset);
  };
  util.toDosTime = function(d) {
    return util.getLongBytes(util.dateToDos(d));
  };
});

// ../../node_modules/.pnpm/compress-commons@6.0.2/node_modules/compress-commons/lib/archivers/zip/general-purpose-bit.js
var require_general_purpose_bit = __commonJS((exports, module) => {
  var zipUtil = require_util3();
  var DATA_DESCRIPTOR_FLAG = 1 << 3;
  var ENCRYPTION_FLAG = 1 << 0;
  var NUMBER_OF_SHANNON_FANO_TREES_FLAG = 1 << 2;
  var SLIDING_DICTIONARY_SIZE_FLAG = 1 << 1;
  var STRONG_ENCRYPTION_FLAG = 1 << 6;
  var UFT8_NAMES_FLAG = 1 << 11;
  var GeneralPurposeBit = module.exports = function() {
    if (!(this instanceof GeneralPurposeBit)) {
      return new GeneralPurposeBit;
    }
    this.descriptor = false;
    this.encryption = false;
    this.utf8 = false;
    this.numberOfShannonFanoTrees = 0;
    this.strongEncryption = false;
    this.slidingDictionarySize = 0;
    return this;
  };
  GeneralPurposeBit.prototype.encode = function() {
    return zipUtil.getShortBytes((this.descriptor ? DATA_DESCRIPTOR_FLAG : 0) | (this.utf8 ? UFT8_NAMES_FLAG : 0) | (this.encryption ? ENCRYPTION_FLAG : 0) | (this.strongEncryption ? STRONG_ENCRYPTION_FLAG : 0));
  };
  GeneralPurposeBit.prototype.parse = function(buf, offset) {
    var flag = zipUtil.getShortBytesValue(buf, offset);
    var gbp = new GeneralPurposeBit;
    gbp.useDataDescriptor((flag & DATA_DESCRIPTOR_FLAG) !== 0);
    gbp.useUTF8ForNames((flag & UFT8_NAMES_FLAG) !== 0);
    gbp.useStrongEncryption((flag & STRONG_ENCRYPTION_FLAG) !== 0);
    gbp.useEncryption((flag & ENCRYPTION_FLAG) !== 0);
    gbp.setSlidingDictionarySize((flag & SLIDING_DICTIONARY_SIZE_FLAG) !== 0 ? 8192 : 4096);
    gbp.setNumberOfShannonFanoTrees((flag & NUMBER_OF_SHANNON_FANO_TREES_FLAG) !== 0 ? 3 : 2);
    return gbp;
  };
  GeneralPurposeBit.prototype.setNumberOfShannonFanoTrees = function(n) {
    this.numberOfShannonFanoTrees = n;
  };
  GeneralPurposeBit.prototype.getNumberOfShannonFanoTrees = function() {
    return this.numberOfShannonFanoTrees;
  };
  GeneralPurposeBit.prototype.setSlidingDictionarySize = function(n) {
    this.slidingDictionarySize = n;
  };
  GeneralPurposeBit.prototype.getSlidingDictionarySize = function() {
    return this.slidingDictionarySize;
  };
  GeneralPurposeBit.prototype.useDataDescriptor = function(b) {
    this.descriptor = b;
  };
  GeneralPurposeBit.prototype.usesDataDescriptor = function() {
    return this.descriptor;
  };
  GeneralPurposeBit.prototype.useEncryption = function(b) {
    this.encryption = b;
  };
  GeneralPurposeBit.prototype.usesEncryption = function() {
    return this.encryption;
  };
  GeneralPurposeBit.prototype.useStrongEncryption = function(b) {
    this.strongEncryption = b;
  };
  GeneralPurposeBit.prototype.usesStrongEncryption = function() {
    return this.strongEncryption;
  };
  GeneralPurposeBit.prototype.useUTF8ForNames = function(b) {
    this.utf8 = b;
  };
  GeneralPurposeBit.prototype.usesUTF8ForNames = function() {
    return this.utf8;
  };
});

// ../../node_modules/.pnpm/compress-commons@6.0.2/node_modules/compress-commons/lib/archivers/zip/unix-stat.js
var require_unix_stat = __commonJS((exports, module) => {
  module.exports = {
    PERM_MASK: 4095,
    FILE_TYPE_FLAG: 61440,
    LINK_FLAG: 40960,
    FILE_FLAG: 32768,
    DIR_FLAG: 16384,
    DEFAULT_LINK_PERM: 511,
    DEFAULT_DIR_PERM: 493,
    DEFAULT_FILE_PERM: 420
  };
});

// ../../node_modules/.pnpm/compress-commons@6.0.2/node_modules/compress-commons/lib/archivers/zip/constants.js
var require_constants = __commonJS((exports, module) => {
  module.exports = {
    WORD: 4,
    DWORD: 8,
    EMPTY: Buffer.alloc(0),
    SHORT: 2,
    SHORT_MASK: 65535,
    SHORT_SHIFT: 16,
    SHORT_ZERO: Buffer.from(Array(2)),
    LONG: 4,
    LONG_ZERO: Buffer.from(Array(4)),
    MIN_VERSION_INITIAL: 10,
    MIN_VERSION_DATA_DESCRIPTOR: 20,
    MIN_VERSION_ZIP64: 45,
    VERSION_MADEBY: 45,
    METHOD_STORED: 0,
    METHOD_DEFLATED: 8,
    PLATFORM_UNIX: 3,
    PLATFORM_FAT: 0,
    SIG_LFH: 67324752,
    SIG_DD: 134695760,
    SIG_CFH: 33639248,
    SIG_EOCD: 101010256,
    SIG_ZIP64_EOCD: 101075792,
    SIG_ZIP64_EOCD_LOC: 117853008,
    ZIP64_MAGIC_SHORT: 65535,
    ZIP64_MAGIC: 4294967295,
    ZIP64_EXTRA_ID: 1,
    ZLIB_NO_COMPRESSION: 0,
    ZLIB_BEST_SPEED: 1,
    ZLIB_BEST_COMPRESSION: 9,
    ZLIB_DEFAULT_COMPRESSION: -1,
    MODE_MASK: 4095,
    DEFAULT_FILE_MODE: 33188,
    DEFAULT_DIR_MODE: 16877,
    EXT_FILE_ATTR_DIR: 1106051088,
    EXT_FILE_ATTR_FILE: 2175008800,
    S_IFMT: 61440,
    S_IFIFO: 4096,
    S_IFCHR: 8192,
    S_IFDIR: 16384,
    S_IFBLK: 24576,
    S_IFREG: 32768,
    S_IFLNK: 40960,
    S_IFSOCK: 49152,
    S_DOS_A: 32,
    S_DOS_D: 16,
    S_DOS_V: 8,
    S_DOS_S: 4,
    S_DOS_H: 2,
    S_DOS_R: 1
  };
});

// ../../node_modules/.pnpm/compress-commons@6.0.2/node_modules/compress-commons/lib/archivers/zip/zip-archive-entry.js
var require_zip_archive_entry = __commonJS((exports, module) => {
  var inherits = __require("util").inherits;
  var normalizePath = require_normalize_path();
  var ArchiveEntry = require_archive_entry();
  var GeneralPurposeBit = require_general_purpose_bit();
  var UnixStat = require_unix_stat();
  var constants = require_constants();
  var zipUtil = require_util3();
  var ZipArchiveEntry = module.exports = function(name) {
    if (!(this instanceof ZipArchiveEntry)) {
      return new ZipArchiveEntry(name);
    }
    ArchiveEntry.call(this);
    this.platform = constants.PLATFORM_FAT;
    this.method = -1;
    this.name = null;
    this.size = 0;
    this.csize = 0;
    this.gpb = new GeneralPurposeBit;
    this.crc = 0;
    this.time = -1;
    this.minver = constants.MIN_VERSION_INITIAL;
    this.mode = -1;
    this.extra = null;
    this.exattr = 0;
    this.inattr = 0;
    this.comment = null;
    if (name) {
      this.setName(name);
    }
  };
  inherits(ZipArchiveEntry, ArchiveEntry);
  ZipArchiveEntry.prototype.getCentralDirectoryExtra = function() {
    return this.getExtra();
  };
  ZipArchiveEntry.prototype.getComment = function() {
    return this.comment !== null ? this.comment : "";
  };
  ZipArchiveEntry.prototype.getCompressedSize = function() {
    return this.csize;
  };
  ZipArchiveEntry.prototype.getCrc = function() {
    return this.crc;
  };
  ZipArchiveEntry.prototype.getExternalAttributes = function() {
    return this.exattr;
  };
  ZipArchiveEntry.prototype.getExtra = function() {
    return this.extra !== null ? this.extra : constants.EMPTY;
  };
  ZipArchiveEntry.prototype.getGeneralPurposeBit = function() {
    return this.gpb;
  };
  ZipArchiveEntry.prototype.getInternalAttributes = function() {
    return this.inattr;
  };
  ZipArchiveEntry.prototype.getLastModifiedDate = function() {
    return this.getTime();
  };
  ZipArchiveEntry.prototype.getLocalFileDataExtra = function() {
    return this.getExtra();
  };
  ZipArchiveEntry.prototype.getMethod = function() {
    return this.method;
  };
  ZipArchiveEntry.prototype.getName = function() {
    return this.name;
  };
  ZipArchiveEntry.prototype.getPlatform = function() {
    return this.platform;
  };
  ZipArchiveEntry.prototype.getSize = function() {
    return this.size;
  };
  ZipArchiveEntry.prototype.getTime = function() {
    return this.time !== -1 ? zipUtil.dosToDate(this.time) : -1;
  };
  ZipArchiveEntry.prototype.getTimeDos = function() {
    return this.time !== -1 ? this.time : 0;
  };
  ZipArchiveEntry.prototype.getUnixMode = function() {
    return this.platform !== constants.PLATFORM_UNIX ? 0 : this.getExternalAttributes() >> constants.SHORT_SHIFT & constants.SHORT_MASK;
  };
  ZipArchiveEntry.prototype.getVersionNeededToExtract = function() {
    return this.minver;
  };
  ZipArchiveEntry.prototype.setComment = function(comment) {
    if (Buffer.byteLength(comment) !== comment.length) {
      this.getGeneralPurposeBit().useUTF8ForNames(true);
    }
    this.comment = comment;
  };
  ZipArchiveEntry.prototype.setCompressedSize = function(size) {
    if (size < 0) {
      throw new Error("invalid entry compressed size");
    }
    this.csize = size;
  };
  ZipArchiveEntry.prototype.setCrc = function(crc) {
    if (crc < 0) {
      throw new Error("invalid entry crc32");
    }
    this.crc = crc;
  };
  ZipArchiveEntry.prototype.setExternalAttributes = function(attr) {
    this.exattr = attr >>> 0;
  };
  ZipArchiveEntry.prototype.setExtra = function(extra) {
    this.extra = extra;
  };
  ZipArchiveEntry.prototype.setGeneralPurposeBit = function(gpb) {
    if (!(gpb instanceof GeneralPurposeBit)) {
      throw new Error("invalid entry GeneralPurposeBit");
    }
    this.gpb = gpb;
  };
  ZipArchiveEntry.prototype.setInternalAttributes = function(attr) {
    this.inattr = attr;
  };
  ZipArchiveEntry.prototype.setMethod = function(method) {
    if (method < 0) {
      throw new Error("invalid entry compression method");
    }
    this.method = method;
  };
  ZipArchiveEntry.prototype.setName = function(name, prependSlash = false) {
    name = normalizePath(name, false).replace(/^\w+:/, "").replace(/^(\.\.\/|\/)+/, "");
    if (prependSlash) {
      name = `/${name}`;
    }
    if (Buffer.byteLength(name) !== name.length) {
      this.getGeneralPurposeBit().useUTF8ForNames(true);
    }
    this.name = name;
  };
  ZipArchiveEntry.prototype.setPlatform = function(platform) {
    this.platform = platform;
  };
  ZipArchiveEntry.prototype.setSize = function(size) {
    if (size < 0) {
      throw new Error("invalid entry size");
    }
    this.size = size;
  };
  ZipArchiveEntry.prototype.setTime = function(time, forceLocalTime) {
    if (!(time instanceof Date)) {
      throw new Error("invalid entry time");
    }
    this.time = zipUtil.dateToDos(time, forceLocalTime);
  };
  ZipArchiveEntry.prototype.setUnixMode = function(mode) {
    mode |= this.isDirectory() ? constants.S_IFDIR : constants.S_IFREG;
    var extattr = 0;
    extattr |= mode << constants.SHORT_SHIFT | (this.isDirectory() ? constants.S_DOS_D : constants.S_DOS_A);
    this.setExternalAttributes(extattr);
    this.mode = mode & constants.MODE_MASK;
    this.platform = constants.PLATFORM_UNIX;
  };
  ZipArchiveEntry.prototype.setVersionNeededToExtract = function(minver) {
    this.minver = minver;
  };
  ZipArchiveEntry.prototype.isDirectory = function() {
    return this.getName().slice(-1) === "/";
  };
  ZipArchiveEntry.prototype.isUnixSymlink = function() {
    return (this.getUnixMode() & UnixStat.FILE_TYPE_FLAG) === UnixStat.LINK_FLAG;
  };
  ZipArchiveEntry.prototype.isZip64 = function() {
    return this.csize > constants.ZIP64_MAGIC || this.size > constants.ZIP64_MAGIC;
  };
});

// ../../node_modules/.pnpm/compress-commons@6.0.2/node_modules/compress-commons/lib/util/index.js
var require_util4 = __commonJS((exports, module) => {
  var Stream = __require("stream").Stream;
  var PassThrough = require_ours().PassThrough;
  var isStream = require_is_stream();
  var util = module.exports = {};
  util.normalizeInputSource = function(source) {
    if (source === null) {
      return Buffer.alloc(0);
    } else if (typeof source === "string") {
      return Buffer.from(source);
    } else if (isStream(source) && !source._readableState) {
      var normalized = new PassThrough;
      source.pipe(normalized);
      return normalized;
    }
    return source;
  };
});

// ../../node_modules/.pnpm/compress-commons@6.0.2/node_modules/compress-commons/lib/archivers/archive-output-stream.js
var require_archive_output_stream = __commonJS((exports, module) => {
  var inherits = __require("util").inherits;
  var isStream = require_is_stream();
  var Transform = require_ours().Transform;
  var ArchiveEntry = require_archive_entry();
  var util = require_util4();
  var ArchiveOutputStream = module.exports = function(options) {
    if (!(this instanceof ArchiveOutputStream)) {
      return new ArchiveOutputStream(options);
    }
    Transform.call(this, options);
    this.offset = 0;
    this._archive = {
      finish: false,
      finished: false,
      processing: false
    };
  };
  inherits(ArchiveOutputStream, Transform);
  ArchiveOutputStream.prototype._appendBuffer = function(zae, source, callback) {};
  ArchiveOutputStream.prototype._appendStream = function(zae, source, callback) {};
  ArchiveOutputStream.prototype._emitErrorCallback = function(err) {
    if (err) {
      this.emit("error", err);
    }
  };
  ArchiveOutputStream.prototype._finish = function(ae) {};
  ArchiveOutputStream.prototype._normalizeEntry = function(ae) {};
  ArchiveOutputStream.prototype._transform = function(chunk, encoding, callback) {
    callback(null, chunk);
  };
  ArchiveOutputStream.prototype.entry = function(ae, source, callback) {
    source = source || null;
    if (typeof callback !== "function") {
      callback = this._emitErrorCallback.bind(this);
    }
    if (!(ae instanceof ArchiveEntry)) {
      callback(new Error("not a valid instance of ArchiveEntry"));
      return;
    }
    if (this._archive.finish || this._archive.finished) {
      callback(new Error("unacceptable entry after finish"));
      return;
    }
    if (this._archive.processing) {
      callback(new Error("already processing an entry"));
      return;
    }
    this._archive.processing = true;
    this._normalizeEntry(ae);
    this._entry = ae;
    source = util.normalizeInputSource(source);
    if (Buffer.isBuffer(source)) {
      this._appendBuffer(ae, source, callback);
    } else if (isStream(source)) {
      this._appendStream(ae, source, callback);
    } else {
      this._archive.processing = false;
      callback(new Error("input source must be valid Stream or Buffer instance"));
      return;
    }
    return this;
  };
  ArchiveOutputStream.prototype.finish = function() {
    if (this._archive.processing) {
      this._archive.finish = true;
      return;
    }
    this._finish();
  };
  ArchiveOutputStream.prototype.getBytesWritten = function() {
    return this.offset;
  };
  ArchiveOutputStream.prototype.write = function(chunk, cb) {
    if (chunk) {
      this.offset += chunk.length;
    }
    return Transform.prototype.write.call(this, chunk, cb);
  };
});

// ../../node_modules/.pnpm/crc-32@1.2.2/node_modules/crc-32/crc32.js
var require_crc32 = __commonJS((exports) => {
  /*! crc32.js (C) 2014-present SheetJS -- http://sheetjs.com */
  var CRC32;
  (function(factory) {
    if (typeof DO_NOT_EXPORT_CRC === "undefined") {
      if (typeof exports === "object") {
        factory(exports);
      } else if (typeof define === "function" && define.amd) {
        define(function() {
          var module2 = {};
          factory(module2);
          return module2;
        });
      } else {
        factory(CRC32 = {});
      }
    } else {
      factory(CRC32 = {});
    }
  })(function(CRC322) {
    CRC322.version = "1.2.2";
    function signed_crc_table() {
      var c = 0, table = new Array(256);
      for (var n = 0;n != 256; ++n) {
        c = n;
        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
        c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
        table[n] = c;
      }
      return typeof Int32Array !== "undefined" ? new Int32Array(table) : table;
    }
    var T0 = signed_crc_table();
    function slice_by_16_tables(T) {
      var c = 0, v = 0, n = 0, table = typeof Int32Array !== "undefined" ? new Int32Array(4096) : new Array(4096);
      for (n = 0;n != 256; ++n)
        table[n] = T[n];
      for (n = 0;n != 256; ++n) {
        v = T[n];
        for (c = 256 + n;c < 4096; c += 256)
          v = table[c] = v >>> 8 ^ T[v & 255];
      }
      var out = [];
      for (n = 1;n != 16; ++n)
        out[n - 1] = typeof Int32Array !== "undefined" ? table.subarray(n * 256, n * 256 + 256) : table.slice(n * 256, n * 256 + 256);
      return out;
    }
    var TT = slice_by_16_tables(T0);
    var T1 = TT[0], T2 = TT[1], T3 = TT[2], T4 = TT[3], T5 = TT[4];
    var T6 = TT[5], T7 = TT[6], T8 = TT[7], T9 = TT[8], Ta = TT[9];
    var Tb = TT[10], Tc = TT[11], Td = TT[12], Te = TT[13], Tf = TT[14];
    function crc32_bstr(bstr, seed) {
      var C = seed ^ -1;
      for (var i = 0, L = bstr.length;i < L; )
        C = C >>> 8 ^ T0[(C ^ bstr.charCodeAt(i++)) & 255];
      return ~C;
    }
    function crc32_buf(B, seed) {
      var C = seed ^ -1, L = B.length - 15, i = 0;
      for (;i < L; )
        C = Tf[B[i++] ^ C & 255] ^ Te[B[i++] ^ C >> 8 & 255] ^ Td[B[i++] ^ C >> 16 & 255] ^ Tc[B[i++] ^ C >>> 24] ^ Tb[B[i++]] ^ Ta[B[i++]] ^ T9[B[i++]] ^ T8[B[i++]] ^ T7[B[i++]] ^ T6[B[i++]] ^ T5[B[i++]] ^ T4[B[i++]] ^ T3[B[i++]] ^ T2[B[i++]] ^ T1[B[i++]] ^ T0[B[i++]];
      L += 15;
      while (i < L)
        C = C >>> 8 ^ T0[(C ^ B[i++]) & 255];
      return ~C;
    }
    function crc32_str(str, seed) {
      var C = seed ^ -1;
      for (var i = 0, L = str.length, c = 0, d = 0;i < L; ) {
        c = str.charCodeAt(i++);
        if (c < 128) {
          C = C >>> 8 ^ T0[(C ^ c) & 255];
        } else if (c < 2048) {
          C = C >>> 8 ^ T0[(C ^ (192 | c >> 6 & 31)) & 255];
          C = C >>> 8 ^ T0[(C ^ (128 | c & 63)) & 255];
        } else if (c >= 55296 && c < 57344) {
          c = (c & 1023) + 64;
          d = str.charCodeAt(i++) & 1023;
          C = C >>> 8 ^ T0[(C ^ (240 | c >> 8 & 7)) & 255];
          C = C >>> 8 ^ T0[(C ^ (128 | c >> 2 & 63)) & 255];
          C = C >>> 8 ^ T0[(C ^ (128 | d >> 6 & 15 | (c & 3) << 4)) & 255];
          C = C >>> 8 ^ T0[(C ^ (128 | d & 63)) & 255];
        } else {
          C = C >>> 8 ^ T0[(C ^ (224 | c >> 12 & 15)) & 255];
          C = C >>> 8 ^ T0[(C ^ (128 | c >> 6 & 63)) & 255];
          C = C >>> 8 ^ T0[(C ^ (128 | c & 63)) & 255];
        }
      }
      return ~C;
    }
    CRC322.table = T0;
    CRC322.bstr = crc32_bstr;
    CRC322.buf = crc32_buf;
    CRC322.str = crc32_str;
  });
});

// ../../node_modules/.pnpm/crc32-stream@6.0.0/node_modules/crc32-stream/lib/crc32-stream.js
var require_crc32_stream = __commonJS((exports, module) => {
  var { Transform } = require_ours();
  var crc32 = require_crc32();

  class CRC32Stream extends Transform {
    constructor(options) {
      super(options);
      this.checksum = Buffer.allocUnsafe(4);
      this.checksum.writeInt32BE(0, 0);
      this.rawSize = 0;
    }
    _transform(chunk, encoding, callback) {
      if (chunk) {
        this.checksum = crc32.buf(chunk, this.checksum) >>> 0;
        this.rawSize += chunk.length;
      }
      callback(null, chunk);
    }
    digest(encoding) {
      const checksum = Buffer.allocUnsafe(4);
      checksum.writeUInt32BE(this.checksum >>> 0, 0);
      return encoding ? checksum.toString(encoding) : checksum;
    }
    hex() {
      return this.digest("hex").toUpperCase();
    }
    size() {
      return this.rawSize;
    }
  }
  module.exports = CRC32Stream;
});

// ../../node_modules/.pnpm/crc32-stream@6.0.0/node_modules/crc32-stream/lib/deflate-crc32-stream.js
var require_deflate_crc32_stream = __commonJS((exports, module) => {
  var { DeflateRaw } = __require("zlib");
  var crc32 = require_crc32();

  class DeflateCRC32Stream extends DeflateRaw {
    constructor(options) {
      super(options);
      this.checksum = Buffer.allocUnsafe(4);
      this.checksum.writeInt32BE(0, 0);
      this.rawSize = 0;
      this.compressedSize = 0;
    }
    push(chunk, encoding) {
      if (chunk) {
        this.compressedSize += chunk.length;
      }
      return super.push(chunk, encoding);
    }
    _transform(chunk, encoding, callback) {
      if (chunk) {
        this.checksum = crc32.buf(chunk, this.checksum) >>> 0;
        this.rawSize += chunk.length;
      }
      super._transform(chunk, encoding, callback);
    }
    digest(encoding) {
      const checksum = Buffer.allocUnsafe(4);
      checksum.writeUInt32BE(this.checksum >>> 0, 0);
      return encoding ? checksum.toString(encoding) : checksum;
    }
    hex() {
      return this.digest("hex").toUpperCase();
    }
    size(compressed = false) {
      if (compressed) {
        return this.compressedSize;
      } else {
        return this.rawSize;
      }
    }
  }
  module.exports = DeflateCRC32Stream;
});

// ../../node_modules/.pnpm/crc32-stream@6.0.0/node_modules/crc32-stream/lib/index.js
var require_lib = __commonJS((exports, module) => {
  module.exports = {
    CRC32Stream: require_crc32_stream(),
    DeflateCRC32Stream: require_deflate_crc32_stream()
  };
});

// ../../node_modules/.pnpm/compress-commons@6.0.2/node_modules/compress-commons/lib/archivers/zip/zip-archive-output-stream.js
var require_zip_archive_output_stream = __commonJS((exports, module) => {
  var inherits = __require("util").inherits;
  var crc32 = require_crc32();
  var { CRC32Stream } = require_lib();
  var { DeflateCRC32Stream } = require_lib();
  var ArchiveOutputStream = require_archive_output_stream();
  var ZipArchiveEntry = require_zip_archive_entry();
  var GeneralPurposeBit = require_general_purpose_bit();
  var constants = require_constants();
  var util = require_util4();
  var zipUtil = require_util3();
  var ZipArchiveOutputStream = module.exports = function(options) {
    if (!(this instanceof ZipArchiveOutputStream)) {
      return new ZipArchiveOutputStream(options);
    }
    options = this.options = this._defaults(options);
    ArchiveOutputStream.call(this, options);
    this._entry = null;
    this._entries = [];
    this._archive = {
      centralLength: 0,
      centralOffset: 0,
      comment: "",
      finish: false,
      finished: false,
      processing: false,
      forceZip64: options.forceZip64,
      forceLocalTime: options.forceLocalTime
    };
  };
  inherits(ZipArchiveOutputStream, ArchiveOutputStream);
  ZipArchiveOutputStream.prototype._afterAppend = function(ae) {
    this._entries.push(ae);
    if (ae.getGeneralPurposeBit().usesDataDescriptor()) {
      this._writeDataDescriptor(ae);
    }
    this._archive.processing = false;
    this._entry = null;
    if (this._archive.finish && !this._archive.finished) {
      this._finish();
    }
  };
  ZipArchiveOutputStream.prototype._appendBuffer = function(ae, source, callback) {
    if (source.length === 0) {
      ae.setMethod(constants.METHOD_STORED);
    }
    var method = ae.getMethod();
    if (method === constants.METHOD_STORED) {
      ae.setSize(source.length);
      ae.setCompressedSize(source.length);
      ae.setCrc(crc32.buf(source) >>> 0);
    }
    this._writeLocalFileHeader(ae);
    if (method === constants.METHOD_STORED) {
      this.write(source);
      this._afterAppend(ae);
      callback(null, ae);
      return;
    } else if (method === constants.METHOD_DEFLATED) {
      this._smartStream(ae, callback).end(source);
      return;
    } else {
      callback(new Error("compression method " + method + " not implemented"));
      return;
    }
  };
  ZipArchiveOutputStream.prototype._appendStream = function(ae, source, callback) {
    ae.getGeneralPurposeBit().useDataDescriptor(true);
    ae.setVersionNeededToExtract(constants.MIN_VERSION_DATA_DESCRIPTOR);
    this._writeLocalFileHeader(ae);
    var smart = this._smartStream(ae, callback);
    source.once("error", function(err) {
      smart.emit("error", err);
      smart.end();
    });
    source.pipe(smart);
  };
  ZipArchiveOutputStream.prototype._defaults = function(o) {
    if (typeof o !== "object") {
      o = {};
    }
    if (typeof o.zlib !== "object") {
      o.zlib = {};
    }
    if (typeof o.zlib.level !== "number") {
      o.zlib.level = constants.ZLIB_BEST_SPEED;
    }
    o.forceZip64 = !!o.forceZip64;
    o.forceLocalTime = !!o.forceLocalTime;
    return o;
  };
  ZipArchiveOutputStream.prototype._finish = function() {
    this._archive.centralOffset = this.offset;
    this._entries.forEach(function(ae) {
      this._writeCentralFileHeader(ae);
    }.bind(this));
    this._archive.centralLength = this.offset - this._archive.centralOffset;
    if (this.isZip64()) {
      this._writeCentralDirectoryZip64();
    }
    this._writeCentralDirectoryEnd();
    this._archive.processing = false;
    this._archive.finish = true;
    this._archive.finished = true;
    this.end();
  };
  ZipArchiveOutputStream.prototype._normalizeEntry = function(ae) {
    if (ae.getMethod() === -1) {
      ae.setMethod(constants.METHOD_DEFLATED);
    }
    if (ae.getMethod() === constants.METHOD_DEFLATED) {
      ae.getGeneralPurposeBit().useDataDescriptor(true);
      ae.setVersionNeededToExtract(constants.MIN_VERSION_DATA_DESCRIPTOR);
    }
    if (ae.getTime() === -1) {
      ae.setTime(new Date, this._archive.forceLocalTime);
    }
    ae._offsets = {
      file: 0,
      data: 0,
      contents: 0
    };
  };
  ZipArchiveOutputStream.prototype._smartStream = function(ae, callback) {
    var deflate = ae.getMethod() === constants.METHOD_DEFLATED;
    var process2 = deflate ? new DeflateCRC32Stream(this.options.zlib) : new CRC32Stream;
    var error = null;
    function handleStuff() {
      var digest = process2.digest().readUInt32BE(0);
      ae.setCrc(digest);
      ae.setSize(process2.size());
      ae.setCompressedSize(process2.size(true));
      this._afterAppend(ae);
      callback(error, ae);
    }
    process2.once("end", handleStuff.bind(this));
    process2.once("error", function(err) {
      error = err;
    });
    process2.pipe(this, { end: false });
    return process2;
  };
  ZipArchiveOutputStream.prototype._writeCentralDirectoryEnd = function() {
    var records = this._entries.length;
    var size = this._archive.centralLength;
    var offset = this._archive.centralOffset;
    if (this.isZip64()) {
      records = constants.ZIP64_MAGIC_SHORT;
      size = constants.ZIP64_MAGIC;
      offset = constants.ZIP64_MAGIC;
    }
    this.write(zipUtil.getLongBytes(constants.SIG_EOCD));
    this.write(constants.SHORT_ZERO);
    this.write(constants.SHORT_ZERO);
    this.write(zipUtil.getShortBytes(records));
    this.write(zipUtil.getShortBytes(records));
    this.write(zipUtil.getLongBytes(size));
    this.write(zipUtil.getLongBytes(offset));
    var comment = this.getComment();
    var commentLength = Buffer.byteLength(comment);
    this.write(zipUtil.getShortBytes(commentLength));
    this.write(comment);
  };
  ZipArchiveOutputStream.prototype._writeCentralDirectoryZip64 = function() {
    this.write(zipUtil.getLongBytes(constants.SIG_ZIP64_EOCD));
    this.write(zipUtil.getEightBytes(44));
    this.write(zipUtil.getShortBytes(constants.MIN_VERSION_ZIP64));
    this.write(zipUtil.getShortBytes(constants.MIN_VERSION_ZIP64));
    this.write(constants.LONG_ZERO);
    this.write(constants.LONG_ZERO);
    this.write(zipUtil.getEightBytes(this._entries.length));
    this.write(zipUtil.getEightBytes(this._entries.length));
    this.write(zipUtil.getEightBytes(this._archive.centralLength));
    this.write(zipUtil.getEightBytes(this._archive.centralOffset));
    this.write(zipUtil.getLongBytes(constants.SIG_ZIP64_EOCD_LOC));
    this.write(constants.LONG_ZERO);
    this.write(zipUtil.getEightBytes(this._archive.centralOffset + this._archive.centralLength));
    this.write(zipUtil.getLongBytes(1));
  };
  ZipArchiveOutputStream.prototype._writeCentralFileHeader = function(ae) {
    var gpb = ae.getGeneralPurposeBit();
    var method = ae.getMethod();
    var fileOffset = ae._offsets.file;
    var size = ae.getSize();
    var compressedSize = ae.getCompressedSize();
    if (ae.isZip64() || fileOffset > constants.ZIP64_MAGIC) {
      size = constants.ZIP64_MAGIC;
      compressedSize = constants.ZIP64_MAGIC;
      fileOffset = constants.ZIP64_MAGIC;
      ae.setVersionNeededToExtract(constants.MIN_VERSION_ZIP64);
      var extraBuf = Buffer.concat([
        zipUtil.getShortBytes(constants.ZIP64_EXTRA_ID),
        zipUtil.getShortBytes(24),
        zipUtil.getEightBytes(ae.getSize()),
        zipUtil.getEightBytes(ae.getCompressedSize()),
        zipUtil.getEightBytes(ae._offsets.file)
      ], 28);
      ae.setExtra(extraBuf);
    }
    this.write(zipUtil.getLongBytes(constants.SIG_CFH));
    this.write(zipUtil.getShortBytes(ae.getPlatform() << 8 | constants.VERSION_MADEBY));
    this.write(zipUtil.getShortBytes(ae.getVersionNeededToExtract()));
    this.write(gpb.encode());
    this.write(zipUtil.getShortBytes(method));
    this.write(zipUtil.getLongBytes(ae.getTimeDos()));
    this.write(zipUtil.getLongBytes(ae.getCrc()));
    this.write(zipUtil.getLongBytes(compressedSize));
    this.write(zipUtil.getLongBytes(size));
    var name = ae.getName();
    var comment = ae.getComment();
    var extra = ae.getCentralDirectoryExtra();
    if (gpb.usesUTF8ForNames()) {
      name = Buffer.from(name);
      comment = Buffer.from(comment);
    }
    this.write(zipUtil.getShortBytes(name.length));
    this.write(zipUtil.getShortBytes(extra.length));
    this.write(zipUtil.getShortBytes(comment.length));
    this.write(constants.SHORT_ZERO);
    this.write(zipUtil.getShortBytes(ae.getInternalAttributes()));
    this.write(zipUtil.getLongBytes(ae.getExternalAttributes()));
    this.write(zipUtil.getLongBytes(fileOffset));
    this.write(name);
    this.write(extra);
    this.write(comment);
  };
  ZipArchiveOutputStream.prototype._writeDataDescriptor = function(ae) {
    this.write(zipUtil.getLongBytes(constants.SIG_DD));
    this.write(zipUtil.getLongBytes(ae.getCrc()));
    if (ae.isZip64()) {
      this.write(zipUtil.getEightBytes(ae.getCompressedSize()));
      this.write(zipUtil.getEightBytes(ae.getSize()));
    } else {
      this.write(zipUtil.getLongBytes(ae.getCompressedSize()));
      this.write(zipUtil.getLongBytes(ae.getSize()));
    }
  };
  ZipArchiveOutputStream.prototype._writeLocalFileHeader = function(ae) {
    var gpb = ae.getGeneralPurposeBit();
    var method = ae.getMethod();
    var name = ae.getName();
    var extra = ae.getLocalFileDataExtra();
    if (ae.isZip64()) {
      gpb.useDataDescriptor(true);
      ae.setVersionNeededToExtract(constants.MIN_VERSION_ZIP64);
    }
    if (gpb.usesUTF8ForNames()) {
      name = Buffer.from(name);
    }
    ae._offsets.file = this.offset;
    this.write(zipUtil.getLongBytes(constants.SIG_LFH));
    this.write(zipUtil.getShortBytes(ae.getVersionNeededToExtract()));
    this.write(gpb.encode());
    this.write(zipUtil.getShortBytes(method));
    this.write(zipUtil.getLongBytes(ae.getTimeDos()));
    ae._offsets.data = this.offset;
    if (gpb.usesDataDescriptor()) {
      this.write(constants.LONG_ZERO);
      this.write(constants.LONG_ZERO);
      this.write(constants.LONG_ZERO);
    } else {
      this.write(zipUtil.getLongBytes(ae.getCrc()));
      this.write(zipUtil.getLongBytes(ae.getCompressedSize()));
      this.write(zipUtil.getLongBytes(ae.getSize()));
    }
    this.write(zipUtil.getShortBytes(name.length));
    this.write(zipUtil.getShortBytes(extra.length));
    this.write(name);
    this.write(extra);
    ae._offsets.contents = this.offset;
  };
  ZipArchiveOutputStream.prototype.getComment = function(comment) {
    return this._archive.comment !== null ? this._archive.comment : "";
  };
  ZipArchiveOutputStream.prototype.isZip64 = function() {
    return this._archive.forceZip64 || this._entries.length > constants.ZIP64_MAGIC_SHORT || this._archive.centralLength > constants.ZIP64_MAGIC || this._archive.centralOffset > constants.ZIP64_MAGIC;
  };
  ZipArchiveOutputStream.prototype.setComment = function(comment) {
    this._archive.comment = comment;
  };
});

// ../../node_modules/.pnpm/compress-commons@6.0.2/node_modules/compress-commons/lib/compress-commons.js
var require_compress_commons = __commonJS((exports, module) => {
  module.exports = {
    ArchiveEntry: require_archive_entry(),
    ZipArchiveEntry: require_zip_archive_entry(),
    ArchiveOutputStream: require_archive_output_stream(),
    ZipArchiveOutputStream: require_zip_archive_output_stream()
  };
});

// ../../node_modules/.pnpm/zip-stream@6.0.1/node_modules/zip-stream/index.js
var require_zip_stream = __commonJS((exports, module) => {
  var inherits = __require("util").inherits;
  var ZipArchiveOutputStream = require_compress_commons().ZipArchiveOutputStream;
  var ZipArchiveEntry = require_compress_commons().ZipArchiveEntry;
  var util = require_archiver_utils();
  var ZipStream = module.exports = function(options) {
    if (!(this instanceof ZipStream)) {
      return new ZipStream(options);
    }
    options = this.options = options || {};
    options.zlib = options.zlib || {};
    ZipArchiveOutputStream.call(this, options);
    if (typeof options.level === "number" && options.level >= 0) {
      options.zlib.level = options.level;
      delete options.level;
    }
    if (!options.forceZip64 && typeof options.zlib.level === "number" && options.zlib.level === 0) {
      options.store = true;
    }
    options.namePrependSlash = options.namePrependSlash || false;
    if (options.comment && options.comment.length > 0) {
      this.setComment(options.comment);
    }
  };
  inherits(ZipStream, ZipArchiveOutputStream);
  ZipStream.prototype._normalizeFileData = function(data) {
    data = util.defaults(data, {
      type: "file",
      name: null,
      namePrependSlash: this.options.namePrependSlash,
      linkname: null,
      date: null,
      mode: null,
      store: this.options.store,
      comment: ""
    });
    var isDir = data.type === "directory";
    var isSymlink = data.type === "symlink";
    if (data.name) {
      data.name = util.sanitizePath(data.name);
      if (!isSymlink && data.name.slice(-1) === "/") {
        isDir = true;
        data.type = "directory";
      } else if (isDir) {
        data.name += "/";
      }
    }
    if (isDir || isSymlink) {
      data.store = true;
    }
    data.date = util.dateify(data.date);
    return data;
  };
  ZipStream.prototype.entry = function(source, data, callback) {
    if (typeof callback !== "function") {
      callback = this._emitErrorCallback.bind(this);
    }
    data = this._normalizeFileData(data);
    if (data.type !== "file" && data.type !== "directory" && data.type !== "symlink") {
      callback(new Error(data.type + " entries not currently supported"));
      return;
    }
    if (typeof data.name !== "string" || data.name.length === 0) {
      callback(new Error("entry name must be a non-empty string value"));
      return;
    }
    if (data.type === "symlink" && typeof data.linkname !== "string") {
      callback(new Error("entry linkname must be a non-empty string value when type equals symlink"));
      return;
    }
    var entry = new ZipArchiveEntry(data.name);
    entry.setTime(data.date, this.options.forceLocalTime);
    if (data.namePrependSlash) {
      entry.setName(data.name, true);
    }
    if (data.store) {
      entry.setMethod(0);
    }
    if (data.comment.length > 0) {
      entry.setComment(data.comment);
    }
    if (data.type === "symlink" && typeof data.mode !== "number") {
      data.mode = 40960;
    }
    if (typeof data.mode === "number") {
      if (data.type === "symlink") {
        data.mode |= 40960;
      }
      entry.setUnixMode(data.mode);
    }
    if (data.type === "symlink" && typeof data.linkname === "string") {
      source = Buffer.from(data.linkname);
    }
    return ZipArchiveOutputStream.prototype.entry.call(this, entry, source, callback);
  };
  ZipStream.prototype.finalize = function() {
    this.finish();
  };
});

// ../../node_modules/.pnpm/archiver@7.0.1/node_modules/archiver/lib/plugins/zip.js
var require_zip = __commonJS((exports, module) => {
  var engine = require_zip_stream();
  var util = require_archiver_utils();
  var Zip = function(options) {
    if (!(this instanceof Zip)) {
      return new Zip(options);
    }
    options = this.options = util.defaults(options, {
      comment: "",
      forceUTC: false,
      namePrependSlash: false,
      store: false
    });
    this.supports = {
      directory: true,
      symlink: true
    };
    this.engine = new engine(options);
  };
  Zip.prototype.append = function(source, data, callback) {
    this.engine.entry(source, data, callback);
  };
  Zip.prototype.finalize = function() {
    this.engine.finalize();
  };
  Zip.prototype.on = function() {
    return this.engine.on.apply(this.engine, arguments);
  };
  Zip.prototype.pipe = function() {
    return this.engine.pipe.apply(this.engine, arguments);
  };
  Zip.prototype.unpipe = function() {
    return this.engine.unpipe.apply(this.engine, arguments);
  };
  module.exports = Zip;
});

// ../../node_modules/.pnpm/fast-fifo@1.3.2/node_modules/fast-fifo/fixed-size.js
var require_fixed_size = __commonJS((exports, module) => {
  module.exports = class FixedFIFO {
    constructor(hwm) {
      if (!(hwm > 0) || (hwm - 1 & hwm) !== 0)
        throw new Error("Max size for a FixedFIFO should be a power of two");
      this.buffer = new Array(hwm);
      this.mask = hwm - 1;
      this.top = 0;
      this.btm = 0;
      this.next = null;
    }
    clear() {
      this.top = this.btm = 0;
      this.next = null;
      this.buffer.fill(undefined);
    }
    push(data) {
      if (this.buffer[this.top] !== undefined)
        return false;
      this.buffer[this.top] = data;
      this.top = this.top + 1 & this.mask;
      return true;
    }
    shift() {
      const last = this.buffer[this.btm];
      if (last === undefined)
        return;
      this.buffer[this.btm] = undefined;
      this.btm = this.btm + 1 & this.mask;
      return last;
    }
    peek() {
      return this.buffer[this.btm];
    }
    isEmpty() {
      return this.buffer[this.btm] === undefined;
    }
  };
});

// ../../node_modules/.pnpm/fast-fifo@1.3.2/node_modules/fast-fifo/index.js
var require_fast_fifo = __commonJS((exports, module) => {
  var FixedFIFO = require_fixed_size();
  module.exports = class FastFIFO {
    constructor(hwm) {
      this.hwm = hwm || 16;
      this.head = new FixedFIFO(this.hwm);
      this.tail = this.head;
      this.length = 0;
    }
    clear() {
      this.head = this.tail;
      this.head.clear();
      this.length = 0;
    }
    push(val) {
      this.length++;
      if (!this.head.push(val)) {
        const prev = this.head;
        this.head = prev.next = new FixedFIFO(2 * this.head.buffer.length);
        this.head.push(val);
      }
    }
    shift() {
      if (this.length !== 0)
        this.length--;
      const val = this.tail.shift();
      if (val === undefined && this.tail.next) {
        const next = this.tail.next;
        this.tail.next = null;
        this.tail = next;
        return this.tail.shift();
      }
      return val;
    }
    peek() {
      const val = this.tail.peek();
      if (val === undefined && this.tail.next)
        return this.tail.next.peek();
      return val;
    }
    isEmpty() {
      return this.length === 0;
    }
  };
});

// ../../node_modules/.pnpm/b4a@1.7.3/node_modules/b4a/index.js
var require_b4a = __commonJS((exports, module) => {
  function isBuffer(value) {
    return Buffer.isBuffer(value) || value instanceof Uint8Array;
  }
  function isEncoding(encoding) {
    return Buffer.isEncoding(encoding);
  }
  function alloc(size, fill2, encoding) {
    return Buffer.alloc(size, fill2, encoding);
  }
  function allocUnsafe(size) {
    return Buffer.allocUnsafe(size);
  }
  function allocUnsafeSlow(size) {
    return Buffer.allocUnsafeSlow(size);
  }
  function byteLength(string, encoding) {
    return Buffer.byteLength(string, encoding);
  }
  function compare(a, b) {
    return Buffer.compare(a, b);
  }
  function concat(buffers, totalLength) {
    return Buffer.concat(buffers, totalLength);
  }
  function copy(source, target, targetStart, start, end) {
    return toBuffer(source).copy(target, targetStart, start, end);
  }
  function equals(a, b) {
    return toBuffer(a).equals(b);
  }
  function fill(buffer, value, offset, end, encoding) {
    return toBuffer(buffer).fill(value, offset, end, encoding);
  }
  function from(value, encodingOrOffset, length) {
    return Buffer.from(value, encodingOrOffset, length);
  }
  function includes(buffer, value, byteOffset, encoding) {
    return toBuffer(buffer).includes(value, byteOffset, encoding);
  }
  function indexOf(buffer, value, byfeOffset, encoding) {
    return toBuffer(buffer).indexOf(value, byfeOffset, encoding);
  }
  function lastIndexOf(buffer, value, byteOffset, encoding) {
    return toBuffer(buffer).lastIndexOf(value, byteOffset, encoding);
  }
  function swap16(buffer) {
    return toBuffer(buffer).swap16();
  }
  function swap32(buffer) {
    return toBuffer(buffer).swap32();
  }
  function swap64(buffer) {
    return toBuffer(buffer).swap64();
  }
  function toBuffer(buffer) {
    if (Buffer.isBuffer(buffer))
      return buffer;
    return Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }
  function toString(buffer, encoding, start, end) {
    return toBuffer(buffer).toString(encoding, start, end);
  }
  function write(buffer, string, offset, length, encoding) {
    return toBuffer(buffer).write(string, offset, length, encoding);
  }
  function readDoubleBE(buffer, offset) {
    return toBuffer(buffer).readDoubleBE(offset);
  }
  function readDoubleLE(buffer, offset) {
    return toBuffer(buffer).readDoubleLE(offset);
  }
  function readFloatBE(buffer, offset) {
    return toBuffer(buffer).readFloatBE(offset);
  }
  function readFloatLE(buffer, offset) {
    return toBuffer(buffer).readFloatLE(offset);
  }
  function readInt32BE(buffer, offset) {
    return toBuffer(buffer).readInt32BE(offset);
  }
  function readInt32LE(buffer, offset) {
    return toBuffer(buffer).readInt32LE(offset);
  }
  function readUInt32BE(buffer, offset) {
    return toBuffer(buffer).readUInt32BE(offset);
  }
  function readUInt32LE(buffer, offset) {
    return toBuffer(buffer).readUInt32LE(offset);
  }
  function writeDoubleBE(buffer, value, offset) {
    return toBuffer(buffer).writeDoubleBE(value, offset);
  }
  function writeDoubleLE(buffer, value, offset) {
    return toBuffer(buffer).writeDoubleLE(value, offset);
  }
  function writeFloatBE(buffer, value, offset) {
    return toBuffer(buffer).writeFloatBE(value, offset);
  }
  function writeFloatLE(buffer, value, offset) {
    return toBuffer(buffer).writeFloatLE(value, offset);
  }
  function writeInt32BE(buffer, value, offset) {
    return toBuffer(buffer).writeInt32BE(value, offset);
  }
  function writeInt32LE(buffer, value, offset) {
    return toBuffer(buffer).writeInt32LE(value, offset);
  }
  function writeUInt32BE(buffer, value, offset) {
    return toBuffer(buffer).writeUInt32BE(value, offset);
  }
  function writeUInt32LE(buffer, value, offset) {
    return toBuffer(buffer).writeUInt32LE(value, offset);
  }
  module.exports = {
    isBuffer,
    isEncoding,
    alloc,
    allocUnsafe,
    allocUnsafeSlow,
    byteLength,
    compare,
    concat,
    copy,
    equals,
    fill,
    from,
    includes,
    indexOf,
    lastIndexOf,
    swap16,
    swap32,
    swap64,
    toBuffer,
    toString,
    write,
    readDoubleBE,
    readDoubleLE,
    readFloatBE,
    readFloatLE,
    readInt32BE,
    readInt32LE,
    readUInt32BE,
    readUInt32LE,
    writeDoubleBE,
    writeDoubleLE,
    writeFloatBE,
    writeFloatLE,
    writeInt32BE,
    writeInt32LE,
    writeUInt32BE,
    writeUInt32LE
  };
});

// ../../node_modules/.pnpm/text-decoder@1.2.3/node_modules/text-decoder/lib/pass-through-decoder.js
var require_pass_through_decoder = __commonJS((exports, module) => {
  var b4a = require_b4a();
  module.exports = class PassThroughDecoder {
    constructor(encoding) {
      this.encoding = encoding;
    }
    get remaining() {
      return 0;
    }
    decode(tail) {
      return b4a.toString(tail, this.encoding);
    }
    flush() {
      return "";
    }
  };
});

// ../../node_modules/.pnpm/text-decoder@1.2.3/node_modules/text-decoder/lib/utf8-decoder.js
var require_utf8_decoder = __commonJS((exports, module) => {
  var b4a = require_b4a();
  module.exports = class UTF8Decoder {
    constructor() {
      this.codePoint = 0;
      this.bytesSeen = 0;
      this.bytesNeeded = 0;
      this.lowerBoundary = 128;
      this.upperBoundary = 191;
    }
    get remaining() {
      return this.bytesSeen;
    }
    decode(data) {
      if (this.bytesNeeded === 0) {
        let isBoundary = true;
        for (let i = Math.max(0, data.byteLength - 4), n = data.byteLength;i < n && isBoundary; i++) {
          isBoundary = data[i] <= 127;
        }
        if (isBoundary)
          return b4a.toString(data, "utf8");
      }
      let result = "";
      for (let i = 0, n = data.byteLength;i < n; i++) {
        const byte = data[i];
        if (this.bytesNeeded === 0) {
          if (byte <= 127) {
            result += String.fromCharCode(byte);
          } else {
            this.bytesSeen = 1;
            if (byte >= 194 && byte <= 223) {
              this.bytesNeeded = 2;
              this.codePoint = byte & 31;
            } else if (byte >= 224 && byte <= 239) {
              if (byte === 224)
                this.lowerBoundary = 160;
              else if (byte === 237)
                this.upperBoundary = 159;
              this.bytesNeeded = 3;
              this.codePoint = byte & 15;
            } else if (byte >= 240 && byte <= 244) {
              if (byte === 240)
                this.lowerBoundary = 144;
              if (byte === 244)
                this.upperBoundary = 143;
              this.bytesNeeded = 4;
              this.codePoint = byte & 7;
            } else {
              result += "�";
            }
          }
          continue;
        }
        if (byte < this.lowerBoundary || byte > this.upperBoundary) {
          this.codePoint = 0;
          this.bytesNeeded = 0;
          this.bytesSeen = 0;
          this.lowerBoundary = 128;
          this.upperBoundary = 191;
          result += "�";
          continue;
        }
        this.lowerBoundary = 128;
        this.upperBoundary = 191;
        this.codePoint = this.codePoint << 6 | byte & 63;
        this.bytesSeen++;
        if (this.bytesSeen !== this.bytesNeeded)
          continue;
        result += String.fromCodePoint(this.codePoint);
        this.codePoint = 0;
        this.bytesNeeded = 0;
        this.bytesSeen = 0;
      }
      return result;
    }
    flush() {
      const result = this.bytesNeeded > 0 ? "�" : "";
      this.codePoint = 0;
      this.bytesNeeded = 0;
      this.bytesSeen = 0;
      this.lowerBoundary = 128;
      this.upperBoundary = 191;
      return result;
    }
  };
});

// ../../node_modules/.pnpm/text-decoder@1.2.3/node_modules/text-decoder/index.js
var require_text_decoder = __commonJS((exports, module) => {
  var PassThroughDecoder = require_pass_through_decoder();
  var UTF8Decoder = require_utf8_decoder();
  module.exports = class TextDecoder {
    constructor(encoding = "utf8") {
      this.encoding = normalizeEncoding(encoding);
      switch (this.encoding) {
        case "utf8":
          this.decoder = new UTF8Decoder;
          break;
        case "utf16le":
        case "base64":
          throw new Error("Unsupported encoding: " + this.encoding);
        default:
          this.decoder = new PassThroughDecoder(this.encoding);
      }
    }
    get remaining() {
      return this.decoder.remaining;
    }
    push(data) {
      if (typeof data === "string")
        return data;
      return this.decoder.decode(data);
    }
    write(data) {
      return this.push(data);
    }
    end(data) {
      let result = "";
      if (data)
        result = this.push(data);
      result += this.decoder.flush();
      return result;
    }
  };
  function normalizeEncoding(encoding) {
    encoding = encoding.toLowerCase();
    switch (encoding) {
      case "utf8":
      case "utf-8":
        return "utf8";
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return "utf16le";
      case "latin1":
      case "binary":
        return "latin1";
      case "base64":
      case "ascii":
      case "hex":
        return encoding;
      default:
        throw new Error("Unknown encoding: " + encoding);
    }
  }
});

// ../../node_modules/.pnpm/streamx@2.23.0/node_modules/streamx/index.js
var require_streamx = __commonJS((exports, module) => {
  var { EventEmitter } = __require("events");
  var STREAM_DESTROYED = new Error("Stream was destroyed");
  var PREMATURE_CLOSE = new Error("Premature close");
  var FIFO = require_fast_fifo();
  var TextDecoder = require_text_decoder();
  var qmt = typeof queueMicrotask === "undefined" ? (fn) => global.process.nextTick(fn) : queueMicrotask;
  var MAX = (1 << 29) - 1;
  var OPENING = 1;
  var PREDESTROYING = 2;
  var DESTROYING = 4;
  var DESTROYED = 8;
  var NOT_OPENING = MAX ^ OPENING;
  var NOT_PREDESTROYING = MAX ^ PREDESTROYING;
  var READ_ACTIVE = 1 << 4;
  var READ_UPDATING = 2 << 4;
  var READ_PRIMARY = 4 << 4;
  var READ_QUEUED = 8 << 4;
  var READ_RESUMED = 16 << 4;
  var READ_PIPE_DRAINED = 32 << 4;
  var READ_ENDING = 64 << 4;
  var READ_EMIT_DATA = 128 << 4;
  var READ_EMIT_READABLE = 256 << 4;
  var READ_EMITTED_READABLE = 512 << 4;
  var READ_DONE = 1024 << 4;
  var READ_NEXT_TICK = 2048 << 4;
  var READ_NEEDS_PUSH = 4096 << 4;
  var READ_READ_AHEAD = 8192 << 4;
  var READ_FLOWING = READ_RESUMED | READ_PIPE_DRAINED;
  var READ_ACTIVE_AND_NEEDS_PUSH = READ_ACTIVE | READ_NEEDS_PUSH;
  var READ_PRIMARY_AND_ACTIVE = READ_PRIMARY | READ_ACTIVE;
  var READ_EMIT_READABLE_AND_QUEUED = READ_EMIT_READABLE | READ_QUEUED;
  var READ_RESUMED_READ_AHEAD = READ_RESUMED | READ_READ_AHEAD;
  var READ_NOT_ACTIVE = MAX ^ READ_ACTIVE;
  var READ_NON_PRIMARY = MAX ^ READ_PRIMARY;
  var READ_NON_PRIMARY_AND_PUSHED = MAX ^ (READ_PRIMARY | READ_NEEDS_PUSH);
  var READ_PUSHED = MAX ^ READ_NEEDS_PUSH;
  var READ_PAUSED = MAX ^ READ_RESUMED;
  var READ_NOT_QUEUED = MAX ^ (READ_QUEUED | READ_EMITTED_READABLE);
  var READ_NOT_ENDING = MAX ^ READ_ENDING;
  var READ_PIPE_NOT_DRAINED = MAX ^ READ_FLOWING;
  var READ_NOT_NEXT_TICK = MAX ^ READ_NEXT_TICK;
  var READ_NOT_UPDATING = MAX ^ READ_UPDATING;
  var READ_NO_READ_AHEAD = MAX ^ READ_READ_AHEAD;
  var READ_PAUSED_NO_READ_AHEAD = MAX ^ READ_RESUMED_READ_AHEAD;
  var WRITE_ACTIVE = 1 << 18;
  var WRITE_UPDATING = 2 << 18;
  var WRITE_PRIMARY = 4 << 18;
  var WRITE_QUEUED = 8 << 18;
  var WRITE_UNDRAINED = 16 << 18;
  var WRITE_DONE = 32 << 18;
  var WRITE_EMIT_DRAIN = 64 << 18;
  var WRITE_NEXT_TICK = 128 << 18;
  var WRITE_WRITING = 256 << 18;
  var WRITE_FINISHING = 512 << 18;
  var WRITE_CORKED = 1024 << 18;
  var WRITE_NOT_ACTIVE = MAX ^ (WRITE_ACTIVE | WRITE_WRITING);
  var WRITE_NON_PRIMARY = MAX ^ WRITE_PRIMARY;
  var WRITE_NOT_FINISHING = MAX ^ (WRITE_ACTIVE | WRITE_FINISHING);
  var WRITE_DRAINED = MAX ^ WRITE_UNDRAINED;
  var WRITE_NOT_QUEUED = MAX ^ WRITE_QUEUED;
  var WRITE_NOT_NEXT_TICK = MAX ^ WRITE_NEXT_TICK;
  var WRITE_NOT_UPDATING = MAX ^ WRITE_UPDATING;
  var WRITE_NOT_CORKED = MAX ^ WRITE_CORKED;
  var ACTIVE = READ_ACTIVE | WRITE_ACTIVE;
  var NOT_ACTIVE = MAX ^ ACTIVE;
  var DONE = READ_DONE | WRITE_DONE;
  var DESTROY_STATUS = DESTROYING | DESTROYED | PREDESTROYING;
  var OPEN_STATUS = DESTROY_STATUS | OPENING;
  var AUTO_DESTROY = DESTROY_STATUS | DONE;
  var NON_PRIMARY = WRITE_NON_PRIMARY & READ_NON_PRIMARY;
  var ACTIVE_OR_TICKING = WRITE_NEXT_TICK | READ_NEXT_TICK;
  var TICKING = ACTIVE_OR_TICKING & NOT_ACTIVE;
  var IS_OPENING = OPEN_STATUS | TICKING;
  var READ_PRIMARY_STATUS = OPEN_STATUS | READ_ENDING | READ_DONE;
  var READ_STATUS = OPEN_STATUS | READ_DONE | READ_QUEUED;
  var READ_ENDING_STATUS = OPEN_STATUS | READ_ENDING | READ_QUEUED;
  var READ_READABLE_STATUS = OPEN_STATUS | READ_EMIT_READABLE | READ_QUEUED | READ_EMITTED_READABLE;
  var SHOULD_NOT_READ = OPEN_STATUS | READ_ACTIVE | READ_ENDING | READ_DONE | READ_NEEDS_PUSH | READ_READ_AHEAD;
  var READ_BACKPRESSURE_STATUS = DESTROY_STATUS | READ_ENDING | READ_DONE;
  var READ_UPDATE_SYNC_STATUS = READ_UPDATING | OPEN_STATUS | READ_NEXT_TICK | READ_PRIMARY;
  var READ_NEXT_TICK_OR_OPENING = READ_NEXT_TICK | OPENING;
  var WRITE_PRIMARY_STATUS = OPEN_STATUS | WRITE_FINISHING | WRITE_DONE;
  var WRITE_QUEUED_AND_UNDRAINED = WRITE_QUEUED | WRITE_UNDRAINED;
  var WRITE_QUEUED_AND_ACTIVE = WRITE_QUEUED | WRITE_ACTIVE;
  var WRITE_DRAIN_STATUS = WRITE_QUEUED | WRITE_UNDRAINED | OPEN_STATUS | WRITE_ACTIVE;
  var WRITE_STATUS = OPEN_STATUS | WRITE_ACTIVE | WRITE_QUEUED | WRITE_CORKED;
  var WRITE_PRIMARY_AND_ACTIVE = WRITE_PRIMARY | WRITE_ACTIVE;
  var WRITE_ACTIVE_AND_WRITING = WRITE_ACTIVE | WRITE_WRITING;
  var WRITE_FINISHING_STATUS = OPEN_STATUS | WRITE_FINISHING | WRITE_QUEUED_AND_ACTIVE | WRITE_DONE;
  var WRITE_BACKPRESSURE_STATUS = WRITE_UNDRAINED | DESTROY_STATUS | WRITE_FINISHING | WRITE_DONE;
  var WRITE_UPDATE_SYNC_STATUS = WRITE_UPDATING | OPEN_STATUS | WRITE_NEXT_TICK | WRITE_PRIMARY;
  var WRITE_DROP_DATA = WRITE_FINISHING | WRITE_DONE | DESTROY_STATUS;
  var asyncIterator = Symbol.asyncIterator || Symbol("asyncIterator");

  class WritableState {
    constructor(stream, { highWaterMark = 16384, map = null, mapWritable, byteLength, byteLengthWritable } = {}) {
      this.stream = stream;
      this.queue = new FIFO;
      this.highWaterMark = highWaterMark;
      this.buffered = 0;
      this.error = null;
      this.pipeline = null;
      this.drains = null;
      this.byteLength = byteLengthWritable || byteLength || defaultByteLength;
      this.map = mapWritable || map;
      this.afterWrite = afterWrite.bind(this);
      this.afterUpdateNextTick = updateWriteNT.bind(this);
    }
    get ended() {
      return (this.stream._duplexState & WRITE_DONE) !== 0;
    }
    push(data) {
      if ((this.stream._duplexState & WRITE_DROP_DATA) !== 0)
        return false;
      if (this.map !== null)
        data = this.map(data);
      this.buffered += this.byteLength(data);
      this.queue.push(data);
      if (this.buffered < this.highWaterMark) {
        this.stream._duplexState |= WRITE_QUEUED;
        return true;
      }
      this.stream._duplexState |= WRITE_QUEUED_AND_UNDRAINED;
      return false;
    }
    shift() {
      const data = this.queue.shift();
      this.buffered -= this.byteLength(data);
      if (this.buffered === 0)
        this.stream._duplexState &= WRITE_NOT_QUEUED;
      return data;
    }
    end(data) {
      if (typeof data === "function")
        this.stream.once("finish", data);
      else if (data !== undefined && data !== null)
        this.push(data);
      this.stream._duplexState = (this.stream._duplexState | WRITE_FINISHING) & WRITE_NON_PRIMARY;
    }
    autoBatch(data, cb) {
      const buffer = [];
      const stream = this.stream;
      buffer.push(data);
      while ((stream._duplexState & WRITE_STATUS) === WRITE_QUEUED_AND_ACTIVE) {
        buffer.push(stream._writableState.shift());
      }
      if ((stream._duplexState & OPEN_STATUS) !== 0)
        return cb(null);
      stream._writev(buffer, cb);
    }
    update() {
      const stream = this.stream;
      stream._duplexState |= WRITE_UPDATING;
      do {
        while ((stream._duplexState & WRITE_STATUS) === WRITE_QUEUED) {
          const data = this.shift();
          stream._duplexState |= WRITE_ACTIVE_AND_WRITING;
          stream._write(data, this.afterWrite);
        }
        if ((stream._duplexState & WRITE_PRIMARY_AND_ACTIVE) === 0)
          this.updateNonPrimary();
      } while (this.continueUpdate() === true);
      stream._duplexState &= WRITE_NOT_UPDATING;
    }
    updateNonPrimary() {
      const stream = this.stream;
      if ((stream._duplexState & WRITE_FINISHING_STATUS) === WRITE_FINISHING) {
        stream._duplexState = stream._duplexState | WRITE_ACTIVE;
        stream._final(afterFinal.bind(this));
        return;
      }
      if ((stream._duplexState & DESTROY_STATUS) === DESTROYING) {
        if ((stream._duplexState & ACTIVE_OR_TICKING) === 0) {
          stream._duplexState |= ACTIVE;
          stream._destroy(afterDestroy.bind(this));
        }
        return;
      }
      if ((stream._duplexState & IS_OPENING) === OPENING) {
        stream._duplexState = (stream._duplexState | ACTIVE) & NOT_OPENING;
        stream._open(afterOpen.bind(this));
      }
    }
    continueUpdate() {
      if ((this.stream._duplexState & WRITE_NEXT_TICK) === 0)
        return false;
      this.stream._duplexState &= WRITE_NOT_NEXT_TICK;
      return true;
    }
    updateCallback() {
      if ((this.stream._duplexState & WRITE_UPDATE_SYNC_STATUS) === WRITE_PRIMARY)
        this.update();
      else
        this.updateNextTick();
    }
    updateNextTick() {
      if ((this.stream._duplexState & WRITE_NEXT_TICK) !== 0)
        return;
      this.stream._duplexState |= WRITE_NEXT_TICK;
      if ((this.stream._duplexState & WRITE_UPDATING) === 0)
        qmt(this.afterUpdateNextTick);
    }
  }

  class ReadableState {
    constructor(stream, { highWaterMark = 16384, map = null, mapReadable, byteLength, byteLengthReadable } = {}) {
      this.stream = stream;
      this.queue = new FIFO;
      this.highWaterMark = highWaterMark === 0 ? 1 : highWaterMark;
      this.buffered = 0;
      this.readAhead = highWaterMark > 0;
      this.error = null;
      this.pipeline = null;
      this.byteLength = byteLengthReadable || byteLength || defaultByteLength;
      this.map = mapReadable || map;
      this.pipeTo = null;
      this.afterRead = afterRead.bind(this);
      this.afterUpdateNextTick = updateReadNT.bind(this);
    }
    get ended() {
      return (this.stream._duplexState & READ_DONE) !== 0;
    }
    pipe(pipeTo, cb) {
      if (this.pipeTo !== null)
        throw new Error("Can only pipe to one destination");
      if (typeof cb !== "function")
        cb = null;
      this.stream._duplexState |= READ_PIPE_DRAINED;
      this.pipeTo = pipeTo;
      this.pipeline = new Pipeline(this.stream, pipeTo, cb);
      if (cb)
        this.stream.on("error", noop);
      if (isStreamx(pipeTo)) {
        pipeTo._writableState.pipeline = this.pipeline;
        if (cb)
          pipeTo.on("error", noop);
        pipeTo.on("finish", this.pipeline.finished.bind(this.pipeline));
      } else {
        const onerror = this.pipeline.done.bind(this.pipeline, pipeTo);
        const onclose = this.pipeline.done.bind(this.pipeline, pipeTo, null);
        pipeTo.on("error", onerror);
        pipeTo.on("close", onclose);
        pipeTo.on("finish", this.pipeline.finished.bind(this.pipeline));
      }
      pipeTo.on("drain", afterDrain.bind(this));
      this.stream.emit("piping", pipeTo);
      pipeTo.emit("pipe", this.stream);
    }
    push(data) {
      const stream = this.stream;
      if (data === null) {
        this.highWaterMark = 0;
        stream._duplexState = (stream._duplexState | READ_ENDING) & READ_NON_PRIMARY_AND_PUSHED;
        return false;
      }
      if (this.map !== null) {
        data = this.map(data);
        if (data === null) {
          stream._duplexState &= READ_PUSHED;
          return this.buffered < this.highWaterMark;
        }
      }
      this.buffered += this.byteLength(data);
      this.queue.push(data);
      stream._duplexState = (stream._duplexState | READ_QUEUED) & READ_PUSHED;
      return this.buffered < this.highWaterMark;
    }
    shift() {
      const data = this.queue.shift();
      this.buffered -= this.byteLength(data);
      if (this.buffered === 0)
        this.stream._duplexState &= READ_NOT_QUEUED;
      return data;
    }
    unshift(data) {
      const pending = [this.map !== null ? this.map(data) : data];
      while (this.buffered > 0)
        pending.push(this.shift());
      for (let i = 0;i < pending.length - 1; i++) {
        const data2 = pending[i];
        this.buffered += this.byteLength(data2);
        this.queue.push(data2);
      }
      this.push(pending[pending.length - 1]);
    }
    read() {
      const stream = this.stream;
      if ((stream._duplexState & READ_STATUS) === READ_QUEUED) {
        const data = this.shift();
        if (this.pipeTo !== null && this.pipeTo.write(data) === false)
          stream._duplexState &= READ_PIPE_NOT_DRAINED;
        if ((stream._duplexState & READ_EMIT_DATA) !== 0)
          stream.emit("data", data);
        return data;
      }
      if (this.readAhead === false) {
        stream._duplexState |= READ_READ_AHEAD;
        this.updateNextTick();
      }
      return null;
    }
    drain() {
      const stream = this.stream;
      while ((stream._duplexState & READ_STATUS) === READ_QUEUED && (stream._duplexState & READ_FLOWING) !== 0) {
        const data = this.shift();
        if (this.pipeTo !== null && this.pipeTo.write(data) === false)
          stream._duplexState &= READ_PIPE_NOT_DRAINED;
        if ((stream._duplexState & READ_EMIT_DATA) !== 0)
          stream.emit("data", data);
      }
    }
    update() {
      const stream = this.stream;
      stream._duplexState |= READ_UPDATING;
      do {
        this.drain();
        while (this.buffered < this.highWaterMark && (stream._duplexState & SHOULD_NOT_READ) === READ_READ_AHEAD) {
          stream._duplexState |= READ_ACTIVE_AND_NEEDS_PUSH;
          stream._read(this.afterRead);
          this.drain();
        }
        if ((stream._duplexState & READ_READABLE_STATUS) === READ_EMIT_READABLE_AND_QUEUED) {
          stream._duplexState |= READ_EMITTED_READABLE;
          stream.emit("readable");
        }
        if ((stream._duplexState & READ_PRIMARY_AND_ACTIVE) === 0)
          this.updateNonPrimary();
      } while (this.continueUpdate() === true);
      stream._duplexState &= READ_NOT_UPDATING;
    }
    updateNonPrimary() {
      const stream = this.stream;
      if ((stream._duplexState & READ_ENDING_STATUS) === READ_ENDING) {
        stream._duplexState = (stream._duplexState | READ_DONE) & READ_NOT_ENDING;
        stream.emit("end");
        if ((stream._duplexState & AUTO_DESTROY) === DONE)
          stream._duplexState |= DESTROYING;
        if (this.pipeTo !== null)
          this.pipeTo.end();
      }
      if ((stream._duplexState & DESTROY_STATUS) === DESTROYING) {
        if ((stream._duplexState & ACTIVE_OR_TICKING) === 0) {
          stream._duplexState |= ACTIVE;
          stream._destroy(afterDestroy.bind(this));
        }
        return;
      }
      if ((stream._duplexState & IS_OPENING) === OPENING) {
        stream._duplexState = (stream._duplexState | ACTIVE) & NOT_OPENING;
        stream._open(afterOpen.bind(this));
      }
    }
    continueUpdate() {
      if ((this.stream._duplexState & READ_NEXT_TICK) === 0)
        return false;
      this.stream._duplexState &= READ_NOT_NEXT_TICK;
      return true;
    }
    updateCallback() {
      if ((this.stream._duplexState & READ_UPDATE_SYNC_STATUS) === READ_PRIMARY)
        this.update();
      else
        this.updateNextTick();
    }
    updateNextTickIfOpen() {
      if ((this.stream._duplexState & READ_NEXT_TICK_OR_OPENING) !== 0)
        return;
      this.stream._duplexState |= READ_NEXT_TICK;
      if ((this.stream._duplexState & READ_UPDATING) === 0)
        qmt(this.afterUpdateNextTick);
    }
    updateNextTick() {
      if ((this.stream._duplexState & READ_NEXT_TICK) !== 0)
        return;
      this.stream._duplexState |= READ_NEXT_TICK;
      if ((this.stream._duplexState & READ_UPDATING) === 0)
        qmt(this.afterUpdateNextTick);
    }
  }

  class TransformState {
    constructor(stream) {
      this.data = null;
      this.afterTransform = afterTransform.bind(stream);
      this.afterFinal = null;
    }
  }

  class Pipeline {
    constructor(src, dst, cb) {
      this.from = src;
      this.to = dst;
      this.afterPipe = cb;
      this.error = null;
      this.pipeToFinished = false;
    }
    finished() {
      this.pipeToFinished = true;
    }
    done(stream, err) {
      if (err)
        this.error = err;
      if (stream === this.to) {
        this.to = null;
        if (this.from !== null) {
          if ((this.from._duplexState & READ_DONE) === 0 || !this.pipeToFinished) {
            this.from.destroy(this.error || new Error("Writable stream closed prematurely"));
          }
          return;
        }
      }
      if (stream === this.from) {
        this.from = null;
        if (this.to !== null) {
          if ((stream._duplexState & READ_DONE) === 0) {
            this.to.destroy(this.error || new Error("Readable stream closed before ending"));
          }
          return;
        }
      }
      if (this.afterPipe !== null)
        this.afterPipe(this.error);
      this.to = this.from = this.afterPipe = null;
    }
  }
  function afterDrain() {
    this.stream._duplexState |= READ_PIPE_DRAINED;
    this.updateCallback();
  }
  function afterFinal(err) {
    const stream = this.stream;
    if (err)
      stream.destroy(err);
    if ((stream._duplexState & DESTROY_STATUS) === 0) {
      stream._duplexState |= WRITE_DONE;
      stream.emit("finish");
    }
    if ((stream._duplexState & AUTO_DESTROY) === DONE) {
      stream._duplexState |= DESTROYING;
    }
    stream._duplexState &= WRITE_NOT_FINISHING;
    if ((stream._duplexState & WRITE_UPDATING) === 0)
      this.update();
    else
      this.updateNextTick();
  }
  function afterDestroy(err) {
    const stream = this.stream;
    if (!err && this.error !== STREAM_DESTROYED)
      err = this.error;
    if (err)
      stream.emit("error", err);
    stream._duplexState |= DESTROYED;
    stream.emit("close");
    const rs = stream._readableState;
    const ws = stream._writableState;
    if (rs !== null && rs.pipeline !== null)
      rs.pipeline.done(stream, err);
    if (ws !== null) {
      while (ws.drains !== null && ws.drains.length > 0)
        ws.drains.shift().resolve(false);
      if (ws.pipeline !== null)
        ws.pipeline.done(stream, err);
    }
  }
  function afterWrite(err) {
    const stream = this.stream;
    if (err)
      stream.destroy(err);
    stream._duplexState &= WRITE_NOT_ACTIVE;
    if (this.drains !== null)
      tickDrains(this.drains);
    if ((stream._duplexState & WRITE_DRAIN_STATUS) === WRITE_UNDRAINED) {
      stream._duplexState &= WRITE_DRAINED;
      if ((stream._duplexState & WRITE_EMIT_DRAIN) === WRITE_EMIT_DRAIN) {
        stream.emit("drain");
      }
    }
    this.updateCallback();
  }
  function afterRead(err) {
    if (err)
      this.stream.destroy(err);
    this.stream._duplexState &= READ_NOT_ACTIVE;
    if (this.readAhead === false && (this.stream._duplexState & READ_RESUMED) === 0)
      this.stream._duplexState &= READ_NO_READ_AHEAD;
    this.updateCallback();
  }
  function updateReadNT() {
    if ((this.stream._duplexState & READ_UPDATING) === 0) {
      this.stream._duplexState &= READ_NOT_NEXT_TICK;
      this.update();
    }
  }
  function updateWriteNT() {
    if ((this.stream._duplexState & WRITE_UPDATING) === 0) {
      this.stream._duplexState &= WRITE_NOT_NEXT_TICK;
      this.update();
    }
  }
  function tickDrains(drains) {
    for (let i = 0;i < drains.length; i++) {
      if (--drains[i].writes === 0) {
        drains.shift().resolve(true);
        i--;
      }
    }
  }
  function afterOpen(err) {
    const stream = this.stream;
    if (err)
      stream.destroy(err);
    if ((stream._duplexState & DESTROYING) === 0) {
      if ((stream._duplexState & READ_PRIMARY_STATUS) === 0)
        stream._duplexState |= READ_PRIMARY;
      if ((stream._duplexState & WRITE_PRIMARY_STATUS) === 0)
        stream._duplexState |= WRITE_PRIMARY;
      stream.emit("open");
    }
    stream._duplexState &= NOT_ACTIVE;
    if (stream._writableState !== null) {
      stream._writableState.updateCallback();
    }
    if (stream._readableState !== null) {
      stream._readableState.updateCallback();
    }
  }
  function afterTransform(err, data) {
    if (data !== undefined && data !== null)
      this.push(data);
    this._writableState.afterWrite(err);
  }
  function newListener(name) {
    if (this._readableState !== null) {
      if (name === "data") {
        this._duplexState |= READ_EMIT_DATA | READ_RESUMED_READ_AHEAD;
        this._readableState.updateNextTick();
      }
      if (name === "readable") {
        this._duplexState |= READ_EMIT_READABLE;
        this._readableState.updateNextTick();
      }
    }
    if (this._writableState !== null) {
      if (name === "drain") {
        this._duplexState |= WRITE_EMIT_DRAIN;
        this._writableState.updateNextTick();
      }
    }
  }

  class Stream extends EventEmitter {
    constructor(opts) {
      super();
      this._duplexState = 0;
      this._readableState = null;
      this._writableState = null;
      if (opts) {
        if (opts.open)
          this._open = opts.open;
        if (opts.destroy)
          this._destroy = opts.destroy;
        if (opts.predestroy)
          this._predestroy = opts.predestroy;
        if (opts.signal) {
          opts.signal.addEventListener("abort", abort.bind(this));
        }
      }
      this.on("newListener", newListener);
    }
    _open(cb) {
      cb(null);
    }
    _destroy(cb) {
      cb(null);
    }
    _predestroy() {}
    get readable() {
      return this._readableState !== null ? true : undefined;
    }
    get writable() {
      return this._writableState !== null ? true : undefined;
    }
    get destroyed() {
      return (this._duplexState & DESTROYED) !== 0;
    }
    get destroying() {
      return (this._duplexState & DESTROY_STATUS) !== 0;
    }
    destroy(err) {
      if ((this._duplexState & DESTROY_STATUS) === 0) {
        if (!err)
          err = STREAM_DESTROYED;
        this._duplexState = (this._duplexState | DESTROYING) & NON_PRIMARY;
        if (this._readableState !== null) {
          this._readableState.highWaterMark = 0;
          this._readableState.error = err;
        }
        if (this._writableState !== null) {
          this._writableState.highWaterMark = 0;
          this._writableState.error = err;
        }
        this._duplexState |= PREDESTROYING;
        this._predestroy();
        this._duplexState &= NOT_PREDESTROYING;
        if (this._readableState !== null)
          this._readableState.updateNextTick();
        if (this._writableState !== null)
          this._writableState.updateNextTick();
      }
    }
  }

  class Readable extends Stream {
    constructor(opts) {
      super(opts);
      this._duplexState |= OPENING | WRITE_DONE | READ_READ_AHEAD;
      this._readableState = new ReadableState(this, opts);
      if (opts) {
        if (this._readableState.readAhead === false)
          this._duplexState &= READ_NO_READ_AHEAD;
        if (opts.read)
          this._read = opts.read;
        if (opts.eagerOpen)
          this._readableState.updateNextTick();
        if (opts.encoding)
          this.setEncoding(opts.encoding);
      }
    }
    setEncoding(encoding) {
      const dec = new TextDecoder(encoding);
      const map = this._readableState.map || echo;
      this._readableState.map = mapOrSkip;
      return this;
      function mapOrSkip(data) {
        const next = dec.push(data);
        return next === "" && (data.byteLength !== 0 || dec.remaining > 0) ? null : map(next);
      }
    }
    _read(cb) {
      cb(null);
    }
    pipe(dest, cb) {
      this._readableState.updateNextTick();
      this._readableState.pipe(dest, cb);
      return dest;
    }
    read() {
      this._readableState.updateNextTick();
      return this._readableState.read();
    }
    push(data) {
      this._readableState.updateNextTickIfOpen();
      return this._readableState.push(data);
    }
    unshift(data) {
      this._readableState.updateNextTickIfOpen();
      return this._readableState.unshift(data);
    }
    resume() {
      this._duplexState |= READ_RESUMED_READ_AHEAD;
      this._readableState.updateNextTick();
      return this;
    }
    pause() {
      this._duplexState &= this._readableState.readAhead === false ? READ_PAUSED_NO_READ_AHEAD : READ_PAUSED;
      return this;
    }
    static _fromAsyncIterator(ite, opts) {
      let destroy;
      const rs = new Readable({
        ...opts,
        read(cb) {
          ite.next().then(push).then(cb.bind(null, null)).catch(cb);
        },
        predestroy() {
          destroy = ite.return();
        },
        destroy(cb) {
          if (!destroy)
            return cb(null);
          destroy.then(cb.bind(null, null)).catch(cb);
        }
      });
      return rs;
      function push(data) {
        if (data.done)
          rs.push(null);
        else
          rs.push(data.value);
      }
    }
    static from(data, opts) {
      if (isReadStreamx(data))
        return data;
      if (data[asyncIterator])
        return this._fromAsyncIterator(data[asyncIterator](), opts);
      if (!Array.isArray(data))
        data = data === undefined ? [] : [data];
      let i = 0;
      return new Readable({
        ...opts,
        read(cb) {
          this.push(i === data.length ? null : data[i++]);
          cb(null);
        }
      });
    }
    static isBackpressured(rs) {
      return (rs._duplexState & READ_BACKPRESSURE_STATUS) !== 0 || rs._readableState.buffered >= rs._readableState.highWaterMark;
    }
    static isPaused(rs) {
      return (rs._duplexState & READ_RESUMED) === 0;
    }
    [asyncIterator]() {
      const stream = this;
      let error = null;
      let promiseResolve = null;
      let promiseReject = null;
      this.on("error", (err) => {
        error = err;
      });
      this.on("readable", onreadable);
      this.on("close", onclose);
      return {
        [asyncIterator]() {
          return this;
        },
        next() {
          return new Promise(function(resolve, reject) {
            promiseResolve = resolve;
            promiseReject = reject;
            const data = stream.read();
            if (data !== null)
              ondata(data);
            else if ((stream._duplexState & DESTROYED) !== 0)
              ondata(null);
          });
        },
        return() {
          return destroy(null);
        },
        throw(err) {
          return destroy(err);
        }
      };
      function onreadable() {
        if (promiseResolve !== null)
          ondata(stream.read());
      }
      function onclose() {
        if (promiseResolve !== null)
          ondata(null);
      }
      function ondata(data) {
        if (promiseReject === null)
          return;
        if (error)
          promiseReject(error);
        else if (data === null && (stream._duplexState & READ_DONE) === 0)
          promiseReject(STREAM_DESTROYED);
        else
          promiseResolve({ value: data, done: data === null });
        promiseReject = promiseResolve = null;
      }
      function destroy(err) {
        stream.destroy(err);
        return new Promise((resolve, reject) => {
          if (stream._duplexState & DESTROYED)
            return resolve({ value: undefined, done: true });
          stream.once("close", function() {
            if (err)
              reject(err);
            else
              resolve({ value: undefined, done: true });
          });
        });
      }
    }
  }

  class Writable extends Stream {
    constructor(opts) {
      super(opts);
      this._duplexState |= OPENING | READ_DONE;
      this._writableState = new WritableState(this, opts);
      if (opts) {
        if (opts.writev)
          this._writev = opts.writev;
        if (opts.write)
          this._write = opts.write;
        if (opts.final)
          this._final = opts.final;
        if (opts.eagerOpen)
          this._writableState.updateNextTick();
      }
    }
    cork() {
      this._duplexState |= WRITE_CORKED;
    }
    uncork() {
      this._duplexState &= WRITE_NOT_CORKED;
      this._writableState.updateNextTick();
    }
    _writev(batch, cb) {
      cb(null);
    }
    _write(data, cb) {
      this._writableState.autoBatch(data, cb);
    }
    _final(cb) {
      cb(null);
    }
    static isBackpressured(ws) {
      return (ws._duplexState & WRITE_BACKPRESSURE_STATUS) !== 0;
    }
    static drained(ws) {
      if (ws.destroyed)
        return Promise.resolve(false);
      const state = ws._writableState;
      const pending = isWritev(ws) ? Math.min(1, state.queue.length) : state.queue.length;
      const writes = pending + (ws._duplexState & WRITE_WRITING ? 1 : 0);
      if (writes === 0)
        return Promise.resolve(true);
      if (state.drains === null)
        state.drains = [];
      return new Promise((resolve) => {
        state.drains.push({ writes, resolve });
      });
    }
    write(data) {
      this._writableState.updateNextTick();
      return this._writableState.push(data);
    }
    end(data) {
      this._writableState.updateNextTick();
      this._writableState.end(data);
      return this;
    }
  }

  class Duplex extends Readable {
    constructor(opts) {
      super(opts);
      this._duplexState = OPENING | this._duplexState & READ_READ_AHEAD;
      this._writableState = new WritableState(this, opts);
      if (opts) {
        if (opts.writev)
          this._writev = opts.writev;
        if (opts.write)
          this._write = opts.write;
        if (opts.final)
          this._final = opts.final;
      }
    }
    cork() {
      this._duplexState |= WRITE_CORKED;
    }
    uncork() {
      this._duplexState &= WRITE_NOT_CORKED;
      this._writableState.updateNextTick();
    }
    _writev(batch, cb) {
      cb(null);
    }
    _write(data, cb) {
      this._writableState.autoBatch(data, cb);
    }
    _final(cb) {
      cb(null);
    }
    write(data) {
      this._writableState.updateNextTick();
      return this._writableState.push(data);
    }
    end(data) {
      this._writableState.updateNextTick();
      this._writableState.end(data);
      return this;
    }
  }

  class Transform extends Duplex {
    constructor(opts) {
      super(opts);
      this._transformState = new TransformState(this);
      if (opts) {
        if (opts.transform)
          this._transform = opts.transform;
        if (opts.flush)
          this._flush = opts.flush;
      }
    }
    _write(data, cb) {
      if (this._readableState.buffered >= this._readableState.highWaterMark) {
        this._transformState.data = data;
      } else {
        this._transform(data, this._transformState.afterTransform);
      }
    }
    _read(cb) {
      if (this._transformState.data !== null) {
        const data = this._transformState.data;
        this._transformState.data = null;
        cb(null);
        this._transform(data, this._transformState.afterTransform);
      } else {
        cb(null);
      }
    }
    destroy(err) {
      super.destroy(err);
      if (this._transformState.data !== null) {
        this._transformState.data = null;
        this._transformState.afterTransform();
      }
    }
    _transform(data, cb) {
      cb(null, data);
    }
    _flush(cb) {
      cb(null);
    }
    _final(cb) {
      this._transformState.afterFinal = cb;
      this._flush(transformAfterFlush.bind(this));
    }
  }

  class PassThrough extends Transform {
  }
  function transformAfterFlush(err, data) {
    const cb = this._transformState.afterFinal;
    if (err)
      return cb(err);
    if (data !== null && data !== undefined)
      this.push(data);
    this.push(null);
    cb(null);
  }
  function pipelinePromise(...streams) {
    return new Promise((resolve, reject) => {
      return pipeline(...streams, (err) => {
        if (err)
          return reject(err);
        resolve();
      });
    });
  }
  function pipeline(stream, ...streams) {
    const all = Array.isArray(stream) ? [...stream, ...streams] : [stream, ...streams];
    const done = all.length && typeof all[all.length - 1] === "function" ? all.pop() : null;
    if (all.length < 2)
      throw new Error("Pipeline requires at least 2 streams");
    let src = all[0];
    let dest = null;
    let error = null;
    for (let i = 1;i < all.length; i++) {
      dest = all[i];
      if (isStreamx(src)) {
        src.pipe(dest, onerror);
      } else {
        errorHandle(src, true, i > 1, onerror);
        src.pipe(dest);
      }
      src = dest;
    }
    if (done) {
      let fin = false;
      const autoDestroy = isStreamx(dest) || !!(dest._writableState && dest._writableState.autoDestroy);
      dest.on("error", (err) => {
        if (error === null)
          error = err;
      });
      dest.on("finish", () => {
        fin = true;
        if (!autoDestroy)
          done(error);
      });
      if (autoDestroy) {
        dest.on("close", () => done(error || (fin ? null : PREMATURE_CLOSE)));
      }
    }
    return dest;
    function errorHandle(s, rd, wr, onerror2) {
      s.on("error", onerror2);
      s.on("close", onclose);
      function onclose() {
        if (rd && s._readableState && !s._readableState.ended)
          return onerror2(PREMATURE_CLOSE);
        if (wr && s._writableState && !s._writableState.ended)
          return onerror2(PREMATURE_CLOSE);
      }
    }
    function onerror(err) {
      if (!err || error)
        return;
      error = err;
      for (const s of all) {
        s.destroy(err);
      }
    }
  }
  function echo(s) {
    return s;
  }
  function isStream(stream) {
    return !!stream._readableState || !!stream._writableState;
  }
  function isStreamx(stream) {
    return typeof stream._duplexState === "number" && isStream(stream);
  }
  function isEnded(stream) {
    return !!stream._readableState && stream._readableState.ended;
  }
  function isFinished(stream) {
    return !!stream._writableState && stream._writableState.ended;
  }
  function getStreamError(stream, opts = {}) {
    const err = stream._readableState && stream._readableState.error || stream._writableState && stream._writableState.error;
    return !opts.all && err === STREAM_DESTROYED ? null : err;
  }
  function isReadStreamx(stream) {
    return isStreamx(stream) && stream.readable;
  }
  function isDisturbed(stream) {
    return (stream._duplexState & OPENING) !== OPENING || (stream._duplexState & ACTIVE_OR_TICKING) !== 0;
  }
  function isTypedArray(data) {
    return typeof data === "object" && data !== null && typeof data.byteLength === "number";
  }
  function defaultByteLength(data) {
    return isTypedArray(data) ? data.byteLength : 1024;
  }
  function noop() {}
  function abort() {
    this.destroy(new Error("Stream aborted."));
  }
  function isWritev(s) {
    return s._writev !== Writable.prototype._writev && s._writev !== Duplex.prototype._writev;
  }
  module.exports = {
    pipeline,
    pipelinePromise,
    isStream,
    isStreamx,
    isEnded,
    isFinished,
    isDisturbed,
    getStreamError,
    Stream,
    Writable,
    Readable,
    Duplex,
    Transform,
    PassThrough
  };
});

// ../../node_modules/.pnpm/tar-stream@3.1.7/node_modules/tar-stream/headers.js
var require_headers = __commonJS((exports) => {
  var b4a = require_b4a();
  var ZEROS = "0000000000000000000";
  var SEVENS = "7777777777777777777";
  var ZERO_OFFSET = 48;
  var USTAR_MAGIC = b4a.from([117, 115, 116, 97, 114, 0]);
  var USTAR_VER = b4a.from([ZERO_OFFSET, ZERO_OFFSET]);
  var GNU_MAGIC = b4a.from([117, 115, 116, 97, 114, 32]);
  var GNU_VER = b4a.from([32, 0]);
  var MASK = 4095;
  var MAGIC_OFFSET = 257;
  var VERSION_OFFSET = 263;
  exports.decodeLongPath = function decodeLongPath(buf, encoding) {
    return decodeStr(buf, 0, buf.length, encoding);
  };
  exports.encodePax = function encodePax(opts) {
    let result = "";
    if (opts.name)
      result += addLength(" path=" + opts.name + `
`);
    if (opts.linkname)
      result += addLength(" linkpath=" + opts.linkname + `
`);
    const pax = opts.pax;
    if (pax) {
      for (const key in pax) {
        result += addLength(" " + key + "=" + pax[key] + `
`);
      }
    }
    return b4a.from(result);
  };
  exports.decodePax = function decodePax(buf) {
    const result = {};
    while (buf.length) {
      let i = 0;
      while (i < buf.length && buf[i] !== 32)
        i++;
      const len = parseInt(b4a.toString(buf.subarray(0, i)), 10);
      if (!len)
        return result;
      const b = b4a.toString(buf.subarray(i + 1, len - 1));
      const keyIndex = b.indexOf("=");
      if (keyIndex === -1)
        return result;
      result[b.slice(0, keyIndex)] = b.slice(keyIndex + 1);
      buf = buf.subarray(len);
    }
    return result;
  };
  exports.encode = function encode(opts) {
    const buf = b4a.alloc(512);
    let name = opts.name;
    let prefix = "";
    if (opts.typeflag === 5 && name[name.length - 1] !== "/")
      name += "/";
    if (b4a.byteLength(name) !== name.length)
      return null;
    while (b4a.byteLength(name) > 100) {
      const i = name.indexOf("/");
      if (i === -1)
        return null;
      prefix += prefix ? "/" + name.slice(0, i) : name.slice(0, i);
      name = name.slice(i + 1);
    }
    if (b4a.byteLength(name) > 100 || b4a.byteLength(prefix) > 155)
      return null;
    if (opts.linkname && b4a.byteLength(opts.linkname) > 100)
      return null;
    b4a.write(buf, name);
    b4a.write(buf, encodeOct(opts.mode & MASK, 6), 100);
    b4a.write(buf, encodeOct(opts.uid, 6), 108);
    b4a.write(buf, encodeOct(opts.gid, 6), 116);
    encodeSize(opts.size, buf, 124);
    b4a.write(buf, encodeOct(opts.mtime.getTime() / 1000 | 0, 11), 136);
    buf[156] = ZERO_OFFSET + toTypeflag(opts.type);
    if (opts.linkname)
      b4a.write(buf, opts.linkname, 157);
    b4a.copy(USTAR_MAGIC, buf, MAGIC_OFFSET);
    b4a.copy(USTAR_VER, buf, VERSION_OFFSET);
    if (opts.uname)
      b4a.write(buf, opts.uname, 265);
    if (opts.gname)
      b4a.write(buf, opts.gname, 297);
    b4a.write(buf, encodeOct(opts.devmajor || 0, 6), 329);
    b4a.write(buf, encodeOct(opts.devminor || 0, 6), 337);
    if (prefix)
      b4a.write(buf, prefix, 345);
    b4a.write(buf, encodeOct(cksum(buf), 6), 148);
    return buf;
  };
  exports.decode = function decode(buf, filenameEncoding, allowUnknownFormat) {
    let typeflag = buf[156] === 0 ? 0 : buf[156] - ZERO_OFFSET;
    let name = decodeStr(buf, 0, 100, filenameEncoding);
    const mode = decodeOct(buf, 100, 8);
    const uid = decodeOct(buf, 108, 8);
    const gid = decodeOct(buf, 116, 8);
    const size = decodeOct(buf, 124, 12);
    const mtime = decodeOct(buf, 136, 12);
    const type = toType(typeflag);
    const linkname = buf[157] === 0 ? null : decodeStr(buf, 157, 100, filenameEncoding);
    const uname = decodeStr(buf, 265, 32);
    const gname = decodeStr(buf, 297, 32);
    const devmajor = decodeOct(buf, 329, 8);
    const devminor = decodeOct(buf, 337, 8);
    const c = cksum(buf);
    if (c === 8 * 32)
      return null;
    if (c !== decodeOct(buf, 148, 8))
      throw new Error("Invalid tar header. Maybe the tar is corrupted or it needs to be gunzipped?");
    if (isUSTAR(buf)) {
      if (buf[345])
        name = decodeStr(buf, 345, 155, filenameEncoding) + "/" + name;
    } else if (isGNU(buf)) {} else {
      if (!allowUnknownFormat) {
        throw new Error("Invalid tar header: unknown format.");
      }
    }
    if (typeflag === 0 && name && name[name.length - 1] === "/")
      typeflag = 5;
    return {
      name,
      mode,
      uid,
      gid,
      size,
      mtime: new Date(1000 * mtime),
      type,
      linkname,
      uname,
      gname,
      devmajor,
      devminor,
      pax: null
    };
  };
  function isUSTAR(buf) {
    return b4a.equals(USTAR_MAGIC, buf.subarray(MAGIC_OFFSET, MAGIC_OFFSET + 6));
  }
  function isGNU(buf) {
    return b4a.equals(GNU_MAGIC, buf.subarray(MAGIC_OFFSET, MAGIC_OFFSET + 6)) && b4a.equals(GNU_VER, buf.subarray(VERSION_OFFSET, VERSION_OFFSET + 2));
  }
  function clamp(index, len, defaultValue) {
    if (typeof index !== "number")
      return defaultValue;
    index = ~~index;
    if (index >= len)
      return len;
    if (index >= 0)
      return index;
    index += len;
    if (index >= 0)
      return index;
    return 0;
  }
  function toType(flag) {
    switch (flag) {
      case 0:
        return "file";
      case 1:
        return "link";
      case 2:
        return "symlink";
      case 3:
        return "character-device";
      case 4:
        return "block-device";
      case 5:
        return "directory";
      case 6:
        return "fifo";
      case 7:
        return "contiguous-file";
      case 72:
        return "pax-header";
      case 55:
        return "pax-global-header";
      case 27:
        return "gnu-long-link-path";
      case 28:
      case 30:
        return "gnu-long-path";
    }
    return null;
  }
  function toTypeflag(flag) {
    switch (flag) {
      case "file":
        return 0;
      case "link":
        return 1;
      case "symlink":
        return 2;
      case "character-device":
        return 3;
      case "block-device":
        return 4;
      case "directory":
        return 5;
      case "fifo":
        return 6;
      case "contiguous-file":
        return 7;
      case "pax-header":
        return 72;
    }
    return 0;
  }
  function indexOf(block, num, offset, end) {
    for (;offset < end; offset++) {
      if (block[offset] === num)
        return offset;
    }
    return end;
  }
  function cksum(block) {
    let sum = 8 * 32;
    for (let i = 0;i < 148; i++)
      sum += block[i];
    for (let j = 156;j < 512; j++)
      sum += block[j];
    return sum;
  }
  function encodeOct(val, n) {
    val = val.toString(8);
    if (val.length > n)
      return SEVENS.slice(0, n) + " ";
    return ZEROS.slice(0, n - val.length) + val + " ";
  }
  function encodeSizeBin(num, buf, off) {
    buf[off] = 128;
    for (let i = 11;i > 0; i--) {
      buf[off + i] = num & 255;
      num = Math.floor(num / 256);
    }
  }
  function encodeSize(num, buf, off) {
    if (num.toString(8).length > 11) {
      encodeSizeBin(num, buf, off);
    } else {
      b4a.write(buf, encodeOct(num, 11), off);
    }
  }
  function parse256(buf) {
    let positive;
    if (buf[0] === 128)
      positive = true;
    else if (buf[0] === 255)
      positive = false;
    else
      return null;
    const tuple = [];
    let i;
    for (i = buf.length - 1;i > 0; i--) {
      const byte = buf[i];
      if (positive)
        tuple.push(byte);
      else
        tuple.push(255 - byte);
    }
    let sum = 0;
    const l = tuple.length;
    for (i = 0;i < l; i++) {
      sum += tuple[i] * Math.pow(256, i);
    }
    return positive ? sum : -1 * sum;
  }
  function decodeOct(val, offset, length) {
    val = val.subarray(offset, offset + length);
    offset = 0;
    if (val[offset] & 128) {
      return parse256(val);
    } else {
      while (offset < val.length && val[offset] === 32)
        offset++;
      const end = clamp(indexOf(val, 32, offset, val.length), val.length, val.length);
      while (offset < end && val[offset] === 0)
        offset++;
      if (end === offset)
        return 0;
      return parseInt(b4a.toString(val.subarray(offset, end)), 8);
    }
  }
  function decodeStr(val, offset, length, encoding) {
    return b4a.toString(val.subarray(offset, indexOf(val, 0, offset, offset + length)), encoding);
  }
  function addLength(str) {
    const len = b4a.byteLength(str);
    let digits = Math.floor(Math.log(len) / Math.log(10)) + 1;
    if (len + digits >= Math.pow(10, digits))
      digits++;
    return len + digits + str;
  }
});

// ../../node_modules/.pnpm/tar-stream@3.1.7/node_modules/tar-stream/extract.js
var require_extract = __commonJS((exports, module) => {
  var { Writable, Readable, getStreamError } = require_streamx();
  var FIFO = require_fast_fifo();
  var b4a = require_b4a();
  var headers = require_headers();
  var EMPTY = b4a.alloc(0);

  class BufferList {
    constructor() {
      this.buffered = 0;
      this.shifted = 0;
      this.queue = new FIFO;
      this._offset = 0;
    }
    push(buffer) {
      this.buffered += buffer.byteLength;
      this.queue.push(buffer);
    }
    shiftFirst(size) {
      return this._buffered === 0 ? null : this._next(size);
    }
    shift(size) {
      if (size > this.buffered)
        return null;
      if (size === 0)
        return EMPTY;
      let chunk = this._next(size);
      if (size === chunk.byteLength)
        return chunk;
      const chunks = [chunk];
      while ((size -= chunk.byteLength) > 0) {
        chunk = this._next(size);
        chunks.push(chunk);
      }
      return b4a.concat(chunks);
    }
    _next(size) {
      const buf = this.queue.peek();
      const rem = buf.byteLength - this._offset;
      if (size >= rem) {
        const sub = this._offset ? buf.subarray(this._offset, buf.byteLength) : buf;
        this.queue.shift();
        this._offset = 0;
        this.buffered -= rem;
        this.shifted += rem;
        return sub;
      }
      this.buffered -= size;
      this.shifted += size;
      return buf.subarray(this._offset, this._offset += size);
    }
  }

  class Source extends Readable {
    constructor(self2, header, offset) {
      super();
      this.header = header;
      this.offset = offset;
      this._parent = self2;
    }
    _read(cb) {
      if (this.header.size === 0) {
        this.push(null);
      }
      if (this._parent._stream === this) {
        this._parent._update();
      }
      cb(null);
    }
    _predestroy() {
      this._parent.destroy(getStreamError(this));
    }
    _detach() {
      if (this._parent._stream === this) {
        this._parent._stream = null;
        this._parent._missing = overflow(this.header.size);
        this._parent._update();
      }
    }
    _destroy(cb) {
      this._detach();
      cb(null);
    }
  }

  class Extract extends Writable {
    constructor(opts) {
      super(opts);
      if (!opts)
        opts = {};
      this._buffer = new BufferList;
      this._offset = 0;
      this._header = null;
      this._stream = null;
      this._missing = 0;
      this._longHeader = false;
      this._callback = noop;
      this._locked = false;
      this._finished = false;
      this._pax = null;
      this._paxGlobal = null;
      this._gnuLongPath = null;
      this._gnuLongLinkPath = null;
      this._filenameEncoding = opts.filenameEncoding || "utf-8";
      this._allowUnknownFormat = !!opts.allowUnknownFormat;
      this._unlockBound = this._unlock.bind(this);
    }
    _unlock(err) {
      this._locked = false;
      if (err) {
        this.destroy(err);
        this._continueWrite(err);
        return;
      }
      this._update();
    }
    _consumeHeader() {
      if (this._locked)
        return false;
      this._offset = this._buffer.shifted;
      try {
        this._header = headers.decode(this._buffer.shift(512), this._filenameEncoding, this._allowUnknownFormat);
      } catch (err) {
        this._continueWrite(err);
        return false;
      }
      if (!this._header)
        return true;
      switch (this._header.type) {
        case "gnu-long-path":
        case "gnu-long-link-path":
        case "pax-global-header":
        case "pax-header":
          this._longHeader = true;
          this._missing = this._header.size;
          return true;
      }
      this._locked = true;
      this._applyLongHeaders();
      if (this._header.size === 0 || this._header.type === "directory") {
        this.emit("entry", this._header, this._createStream(), this._unlockBound);
        return true;
      }
      this._stream = this._createStream();
      this._missing = this._header.size;
      this.emit("entry", this._header, this._stream, this._unlockBound);
      return true;
    }
    _applyLongHeaders() {
      if (this._gnuLongPath) {
        this._header.name = this._gnuLongPath;
        this._gnuLongPath = null;
      }
      if (this._gnuLongLinkPath) {
        this._header.linkname = this._gnuLongLinkPath;
        this._gnuLongLinkPath = null;
      }
      if (this._pax) {
        if (this._pax.path)
          this._header.name = this._pax.path;
        if (this._pax.linkpath)
          this._header.linkname = this._pax.linkpath;
        if (this._pax.size)
          this._header.size = parseInt(this._pax.size, 10);
        this._header.pax = this._pax;
        this._pax = null;
      }
    }
    _decodeLongHeader(buf) {
      switch (this._header.type) {
        case "gnu-long-path":
          this._gnuLongPath = headers.decodeLongPath(buf, this._filenameEncoding);
          break;
        case "gnu-long-link-path":
          this._gnuLongLinkPath = headers.decodeLongPath(buf, this._filenameEncoding);
          break;
        case "pax-global-header":
          this._paxGlobal = headers.decodePax(buf);
          break;
        case "pax-header":
          this._pax = this._paxGlobal === null ? headers.decodePax(buf) : Object.assign({}, this._paxGlobal, headers.decodePax(buf));
          break;
      }
    }
    _consumeLongHeader() {
      this._longHeader = false;
      this._missing = overflow(this._header.size);
      const buf = this._buffer.shift(this._header.size);
      try {
        this._decodeLongHeader(buf);
      } catch (err) {
        this._continueWrite(err);
        return false;
      }
      return true;
    }
    _consumeStream() {
      const buf = this._buffer.shiftFirst(this._missing);
      if (buf === null)
        return false;
      this._missing -= buf.byteLength;
      const drained = this._stream.push(buf);
      if (this._missing === 0) {
        this._stream.push(null);
        if (drained)
          this._stream._detach();
        return drained && this._locked === false;
      }
      return drained;
    }
    _createStream() {
      return new Source(this, this._header, this._offset);
    }
    _update() {
      while (this._buffer.buffered > 0 && !this.destroying) {
        if (this._missing > 0) {
          if (this._stream !== null) {
            if (this._consumeStream() === false)
              return;
            continue;
          }
          if (this._longHeader === true) {
            if (this._missing > this._buffer.buffered)
              break;
            if (this._consumeLongHeader() === false)
              return false;
            continue;
          }
          const ignore = this._buffer.shiftFirst(this._missing);
          if (ignore !== null)
            this._missing -= ignore.byteLength;
          continue;
        }
        if (this._buffer.buffered < 512)
          break;
        if (this._stream !== null || this._consumeHeader() === false)
          return;
      }
      this._continueWrite(null);
    }
    _continueWrite(err) {
      const cb = this._callback;
      this._callback = noop;
      cb(err);
    }
    _write(data, cb) {
      this._callback = cb;
      this._buffer.push(data);
      this._update();
    }
    _final(cb) {
      this._finished = this._missing === 0 && this._buffer.buffered === 0;
      cb(this._finished ? null : new Error("Unexpected end of data"));
    }
    _predestroy() {
      this._continueWrite(null);
    }
    _destroy(cb) {
      if (this._stream)
        this._stream.destroy(getStreamError(this));
      cb(null);
    }
    [Symbol.asyncIterator]() {
      let error = null;
      let promiseResolve = null;
      let promiseReject = null;
      let entryStream = null;
      let entryCallback = null;
      const extract = this;
      this.on("entry", onentry);
      this.on("error", (err) => {
        error = err;
      });
      this.on("close", onclose);
      return {
        [Symbol.asyncIterator]() {
          return this;
        },
        next() {
          return new Promise(onnext);
        },
        return() {
          return destroy(null);
        },
        throw(err) {
          return destroy(err);
        }
      };
      function consumeCallback(err) {
        if (!entryCallback)
          return;
        const cb = entryCallback;
        entryCallback = null;
        cb(err);
      }
      function onnext(resolve, reject) {
        if (error) {
          return reject(error);
        }
        if (entryStream) {
          resolve({ value: entryStream, done: false });
          entryStream = null;
          return;
        }
        promiseResolve = resolve;
        promiseReject = reject;
        consumeCallback(null);
        if (extract._finished && promiseResolve) {
          promiseResolve({ value: undefined, done: true });
          promiseResolve = promiseReject = null;
        }
      }
      function onentry(header, stream, callback) {
        entryCallback = callback;
        stream.on("error", noop);
        if (promiseResolve) {
          promiseResolve({ value: stream, done: false });
          promiseResolve = promiseReject = null;
        } else {
          entryStream = stream;
        }
      }
      function onclose() {
        consumeCallback(error);
        if (!promiseResolve)
          return;
        if (error)
          promiseReject(error);
        else
          promiseResolve({ value: undefined, done: true });
        promiseResolve = promiseReject = null;
      }
      function destroy(err) {
        extract.destroy(err);
        consumeCallback(err);
        return new Promise((resolve, reject) => {
          if (extract.destroyed)
            return resolve({ value: undefined, done: true });
          extract.once("close", function() {
            if (err)
              reject(err);
            else
              resolve({ value: undefined, done: true });
          });
        });
      }
    }
  }
  module.exports = function extract(opts) {
    return new Extract(opts);
  };
  function noop() {}
  function overflow(size) {
    size &= 511;
    return size && 512 - size;
  }
});

// ../../node_modules/.pnpm/tar-stream@3.1.7/node_modules/tar-stream/constants.js
var require_constants2 = __commonJS((exports, module) => {
  var constants = {
    S_IFMT: 61440,
    S_IFDIR: 16384,
    S_IFCHR: 8192,
    S_IFBLK: 24576,
    S_IFIFO: 4096,
    S_IFLNK: 40960
  };
  try {
    module.exports = __require("fs").constants || constants;
  } catch {
    module.exports = constants;
  }
});

// ../../node_modules/.pnpm/tar-stream@3.1.7/node_modules/tar-stream/pack.js
var require_pack = __commonJS((exports, module) => {
  var { Readable, Writable, getStreamError } = require_streamx();
  var b4a = require_b4a();
  var constants = require_constants2();
  var headers = require_headers();
  var DMODE = 493;
  var FMODE = 420;
  var END_OF_TAR = b4a.alloc(1024);

  class Sink extends Writable {
    constructor(pack, header, callback) {
      super({ mapWritable, eagerOpen: true });
      this.written = 0;
      this.header = header;
      this._callback = callback;
      this._linkname = null;
      this._isLinkname = header.type === "symlink" && !header.linkname;
      this._isVoid = header.type !== "file" && header.type !== "contiguous-file";
      this._finished = false;
      this._pack = pack;
      this._openCallback = null;
      if (this._pack._stream === null)
        this._pack._stream = this;
      else
        this._pack._pending.push(this);
    }
    _open(cb) {
      this._openCallback = cb;
      if (this._pack._stream === this)
        this._continueOpen();
    }
    _continuePack(err) {
      if (this._callback === null)
        return;
      const callback = this._callback;
      this._callback = null;
      callback(err);
    }
    _continueOpen() {
      if (this._pack._stream === null)
        this._pack._stream = this;
      const cb = this._openCallback;
      this._openCallback = null;
      if (cb === null)
        return;
      if (this._pack.destroying)
        return cb(new Error("pack stream destroyed"));
      if (this._pack._finalized)
        return cb(new Error("pack stream is already finalized"));
      this._pack._stream = this;
      if (!this._isLinkname) {
        this._pack._encode(this.header);
      }
      if (this._isVoid) {
        this._finish();
        this._continuePack(null);
      }
      cb(null);
    }
    _write(data, cb) {
      if (this._isLinkname) {
        this._linkname = this._linkname ? b4a.concat([this._linkname, data]) : data;
        return cb(null);
      }
      if (this._isVoid) {
        if (data.byteLength > 0) {
          return cb(new Error("No body allowed for this entry"));
        }
        return cb();
      }
      this.written += data.byteLength;
      if (this._pack.push(data))
        return cb();
      this._pack._drain = cb;
    }
    _finish() {
      if (this._finished)
        return;
      this._finished = true;
      if (this._isLinkname) {
        this.header.linkname = this._linkname ? b4a.toString(this._linkname, "utf-8") : "";
        this._pack._encode(this.header);
      }
      overflow(this._pack, this.header.size);
      this._pack._done(this);
    }
    _final(cb) {
      if (this.written !== this.header.size) {
        return cb(new Error("Size mismatch"));
      }
      this._finish();
      cb(null);
    }
    _getError() {
      return getStreamError(this) || new Error("tar entry destroyed");
    }
    _predestroy() {
      this._pack.destroy(this._getError());
    }
    _destroy(cb) {
      this._pack._done(this);
      this._continuePack(this._finished ? null : this._getError());
      cb();
    }
  }

  class Pack extends Readable {
    constructor(opts) {
      super(opts);
      this._drain = noop;
      this._finalized = false;
      this._finalizing = false;
      this._pending = [];
      this._stream = null;
    }
    entry(header, buffer, callback) {
      if (this._finalized || this.destroying)
        throw new Error("already finalized or destroyed");
      if (typeof buffer === "function") {
        callback = buffer;
        buffer = null;
      }
      if (!callback)
        callback = noop;
      if (!header.size || header.type === "symlink")
        header.size = 0;
      if (!header.type)
        header.type = modeToType(header.mode);
      if (!header.mode)
        header.mode = header.type === "directory" ? DMODE : FMODE;
      if (!header.uid)
        header.uid = 0;
      if (!header.gid)
        header.gid = 0;
      if (!header.mtime)
        header.mtime = new Date;
      if (typeof buffer === "string")
        buffer = b4a.from(buffer);
      const sink = new Sink(this, header, callback);
      if (b4a.isBuffer(buffer)) {
        header.size = buffer.byteLength;
        sink.write(buffer);
        sink.end();
        return sink;
      }
      if (sink._isVoid) {
        return sink;
      }
      return sink;
    }
    finalize() {
      if (this._stream || this._pending.length > 0) {
        this._finalizing = true;
        return;
      }
      if (this._finalized)
        return;
      this._finalized = true;
      this.push(END_OF_TAR);
      this.push(null);
    }
    _done(stream) {
      if (stream !== this._stream)
        return;
      this._stream = null;
      if (this._finalizing)
        this.finalize();
      if (this._pending.length)
        this._pending.shift()._continueOpen();
    }
    _encode(header) {
      if (!header.pax) {
        const buf = headers.encode(header);
        if (buf) {
          this.push(buf);
          return;
        }
      }
      this._encodePax(header);
    }
    _encodePax(header) {
      const paxHeader = headers.encodePax({
        name: header.name,
        linkname: header.linkname,
        pax: header.pax
      });
      const newHeader = {
        name: "PaxHeader",
        mode: header.mode,
        uid: header.uid,
        gid: header.gid,
        size: paxHeader.byteLength,
        mtime: header.mtime,
        type: "pax-header",
        linkname: header.linkname && "PaxHeader",
        uname: header.uname,
        gname: header.gname,
        devmajor: header.devmajor,
        devminor: header.devminor
      };
      this.push(headers.encode(newHeader));
      this.push(paxHeader);
      overflow(this, paxHeader.byteLength);
      newHeader.size = header.size;
      newHeader.type = header.type;
      this.push(headers.encode(newHeader));
    }
    _doDrain() {
      const drain = this._drain;
      this._drain = noop;
      drain();
    }
    _predestroy() {
      const err = getStreamError(this);
      if (this._stream)
        this._stream.destroy(err);
      while (this._pending.length) {
        const stream = this._pending.shift();
        stream.destroy(err);
        stream._continueOpen();
      }
      this._doDrain();
    }
    _read(cb) {
      this._doDrain();
      cb();
    }
  }
  module.exports = function pack(opts) {
    return new Pack(opts);
  };
  function modeToType(mode) {
    switch (mode & constants.S_IFMT) {
      case constants.S_IFBLK:
        return "block-device";
      case constants.S_IFCHR:
        return "character-device";
      case constants.S_IFDIR:
        return "directory";
      case constants.S_IFIFO:
        return "fifo";
      case constants.S_IFLNK:
        return "symlink";
    }
    return "file";
  }
  function noop() {}
  function overflow(self2, size) {
    size &= 511;
    if (size)
      self2.push(END_OF_TAR.subarray(0, 512 - size));
  }
  function mapWritable(buf) {
    return b4a.isBuffer(buf) ? buf : b4a.from(buf);
  }
});

// ../../node_modules/.pnpm/tar-stream@3.1.7/node_modules/tar-stream/index.js
var require_tar_stream = __commonJS((exports) => {
  exports.extract = require_extract();
  exports.pack = require_pack();
});

// ../../node_modules/.pnpm/archiver@7.0.1/node_modules/archiver/lib/plugins/tar.js
var require_tar = __commonJS((exports, module) => {
  var zlib = __require("zlib");
  var engine = require_tar_stream();
  var util = require_archiver_utils();
  var Tar = function(options) {
    if (!(this instanceof Tar)) {
      return new Tar(options);
    }
    options = this.options = util.defaults(options, {
      gzip: false
    });
    if (typeof options.gzipOptions !== "object") {
      options.gzipOptions = {};
    }
    this.supports = {
      directory: true,
      symlink: true
    };
    this.engine = engine.pack(options);
    this.compressor = false;
    if (options.gzip) {
      this.compressor = zlib.createGzip(options.gzipOptions);
      this.compressor.on("error", this._onCompressorError.bind(this));
    }
  };
  Tar.prototype._onCompressorError = function(err) {
    this.engine.emit("error", err);
  };
  Tar.prototype.append = function(source, data, callback) {
    var self2 = this;
    data.mtime = data.date;
    function append(err, sourceBuffer) {
      if (err) {
        callback(err);
        return;
      }
      self2.engine.entry(data, sourceBuffer, function(err2) {
        callback(err2, data);
      });
    }
    if (data.sourceType === "buffer") {
      append(null, source);
    } else if (data.sourceType === "stream" && data.stats) {
      data.size = data.stats.size;
      var entry = self2.engine.entry(data, function(err) {
        callback(err, data);
      });
      source.pipe(entry);
    } else if (data.sourceType === "stream") {
      util.collectStream(source, append);
    }
  };
  Tar.prototype.finalize = function() {
    this.engine.finalize();
  };
  Tar.prototype.on = function() {
    return this.engine.on.apply(this.engine, arguments);
  };
  Tar.prototype.pipe = function(destination, options) {
    if (this.compressor) {
      return this.engine.pipe.apply(this.engine, [this.compressor]).pipe(destination, options);
    } else {
      return this.engine.pipe.apply(this.engine, arguments);
    }
  };
  Tar.prototype.unpipe = function() {
    if (this.compressor) {
      return this.compressor.unpipe.apply(this.compressor, arguments);
    } else {
      return this.engine.unpipe.apply(this.engine, arguments);
    }
  };
  module.exports = Tar;
});

// ../../node_modules/.pnpm/buffer-crc32@1.0.0/node_modules/buffer-crc32/dist/index.cjs
var require_dist = __commonJS((exports, module) => {
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var CRC_TABLE = new Int32Array([
    0,
    1996959894,
    3993919788,
    2567524794,
    124634137,
    1886057615,
    3915621685,
    2657392035,
    249268274,
    2044508324,
    3772115230,
    2547177864,
    162941995,
    2125561021,
    3887607047,
    2428444049,
    498536548,
    1789927666,
    4089016648,
    2227061214,
    450548861,
    1843258603,
    4107580753,
    2211677639,
    325883990,
    1684777152,
    4251122042,
    2321926636,
    335633487,
    1661365465,
    4195302755,
    2366115317,
    997073096,
    1281953886,
    3579855332,
    2724688242,
    1006888145,
    1258607687,
    3524101629,
    2768942443,
    901097722,
    1119000684,
    3686517206,
    2898065728,
    853044451,
    1172266101,
    3705015759,
    2882616665,
    651767980,
    1373503546,
    3369554304,
    3218104598,
    565507253,
    1454621731,
    3485111705,
    3099436303,
    671266974,
    1594198024,
    3322730930,
    2970347812,
    795835527,
    1483230225,
    3244367275,
    3060149565,
    1994146192,
    31158534,
    2563907772,
    4023717930,
    1907459465,
    112637215,
    2680153253,
    3904427059,
    2013776290,
    251722036,
    2517215374,
    3775830040,
    2137656763,
    141376813,
    2439277719,
    3865271297,
    1802195444,
    476864866,
    2238001368,
    4066508878,
    1812370925,
    453092731,
    2181625025,
    4111451223,
    1706088902,
    314042704,
    2344532202,
    4240017532,
    1658658271,
    366619977,
    2362670323,
    4224994405,
    1303535960,
    984961486,
    2747007092,
    3569037538,
    1256170817,
    1037604311,
    2765210733,
    3554079995,
    1131014506,
    879679996,
    2909243462,
    3663771856,
    1141124467,
    855842277,
    2852801631,
    3708648649,
    1342533948,
    654459306,
    3188396048,
    3373015174,
    1466479909,
    544179635,
    3110523913,
    3462522015,
    1591671054,
    702138776,
    2966460450,
    3352799412,
    1504918807,
    783551873,
    3082640443,
    3233442989,
    3988292384,
    2596254646,
    62317068,
    1957810842,
    3939845945,
    2647816111,
    81470997,
    1943803523,
    3814918930,
    2489596804,
    225274430,
    2053790376,
    3826175755,
    2466906013,
    167816743,
    2097651377,
    4027552580,
    2265490386,
    503444072,
    1762050814,
    4150417245,
    2154129355,
    426522225,
    1852507879,
    4275313526,
    2312317920,
    282753626,
    1742555852,
    4189708143,
    2394877945,
    397917763,
    1622183637,
    3604390888,
    2714866558,
    953729732,
    1340076626,
    3518719985,
    2797360999,
    1068828381,
    1219638859,
    3624741850,
    2936675148,
    906185462,
    1090812512,
    3747672003,
    2825379669,
    829329135,
    1181335161,
    3412177804,
    3160834842,
    628085408,
    1382605366,
    3423369109,
    3138078467,
    570562233,
    1426400815,
    3317316542,
    2998733608,
    733239954,
    1555261956,
    3268935591,
    3050360625,
    752459403,
    1541320221,
    2607071920,
    3965973030,
    1969922972,
    40735498,
    2617837225,
    3943577151,
    1913087877,
    83908371,
    2512341634,
    3803740692,
    2075208622,
    213261112,
    2463272603,
    3855990285,
    2094854071,
    198958881,
    2262029012,
    4057260610,
    1759359992,
    534414190,
    2176718541,
    4139329115,
    1873836001,
    414664567,
    2282248934,
    4279200368,
    1711684554,
    285281116,
    2405801727,
    4167216745,
    1634467795,
    376229701,
    2685067896,
    3608007406,
    1308918612,
    956543938,
    2808555105,
    3495958263,
    1231636301,
    1047427035,
    2932959818,
    3654703836,
    1088359270,
    936918000,
    2847714899,
    3736837829,
    1202900863,
    817233897,
    3183342108,
    3401237130,
    1404277552,
    615818150,
    3134207493,
    3453421203,
    1423857449,
    601450431,
    3009837614,
    3294710456,
    1567103746,
    711928724,
    3020668471,
    3272380065,
    1510334235,
    755167117
  ]);
  function ensureBuffer(input) {
    if (Buffer.isBuffer(input)) {
      return input;
    }
    if (typeof input === "number") {
      return Buffer.alloc(input);
    } else if (typeof input === "string") {
      return Buffer.from(input);
    } else {
      throw new Error("input must be buffer, number, or string, received " + typeof input);
    }
  }
  function bufferizeInt(num) {
    const tmp = ensureBuffer(4);
    tmp.writeInt32BE(num, 0);
    return tmp;
  }
  function _crc32(buf, previous) {
    buf = ensureBuffer(buf);
    if (Buffer.isBuffer(previous)) {
      previous = previous.readUInt32BE(0);
    }
    let crc = ~~previous ^ -1;
    for (var n = 0;n < buf.length; n++) {
      crc = CRC_TABLE[(crc ^ buf[n]) & 255] ^ crc >>> 8;
    }
    return crc ^ -1;
  }
  function crc32() {
    return bufferizeInt(_crc32.apply(null, arguments));
  }
  crc32.signed = function() {
    return _crc32.apply(null, arguments);
  };
  crc32.unsigned = function() {
    return _crc32.apply(null, arguments) >>> 0;
  };
  var bufferCrc32 = crc32;
  var index = /* @__PURE__ */ getDefaultExportFromCjs(bufferCrc32);
  module.exports = index;
});

// ../../node_modules/.pnpm/archiver@7.0.1/node_modules/archiver/lib/plugins/json.js
var require_json = __commonJS((exports, module) => {
  var inherits = __require("util").inherits;
  var Transform = require_ours().Transform;
  var crc32 = require_dist();
  var util = require_archiver_utils();
  var Json = function(options) {
    if (!(this instanceof Json)) {
      return new Json(options);
    }
    options = this.options = util.defaults(options, {});
    Transform.call(this, options);
    this.supports = {
      directory: true,
      symlink: true
    };
    this.files = [];
  };
  inherits(Json, Transform);
  Json.prototype._transform = function(chunk, encoding, callback) {
    callback(null, chunk);
  };
  Json.prototype._writeStringified = function() {
    var fileString = JSON.stringify(this.files);
    this.write(fileString);
  };
  Json.prototype.append = function(source, data, callback) {
    var self2 = this;
    data.crc32 = 0;
    function onend(err, sourceBuffer) {
      if (err) {
        callback(err);
        return;
      }
      data.size = sourceBuffer.length || 0;
      data.crc32 = crc32.unsigned(sourceBuffer);
      self2.files.push(data);
      callback(null, data);
    }
    if (data.sourceType === "buffer") {
      onend(null, source);
    } else if (data.sourceType === "stream") {
      util.collectStream(source, onend);
    }
  };
  Json.prototype.finalize = function() {
    this._writeStringified();
    this.end();
  };
  module.exports = Json;
});

// ../../node_modules/.pnpm/archiver@7.0.1/node_modules/archiver/index.js
var require_archiver = __commonJS((exports, module) => {
  var Archiver = require_core();
  var formats = {};
  var vending = function(format, options) {
    return vending.create(format, options);
  };
  vending.create = function(format, options) {
    if (formats[format]) {
      var instance = new Archiver(format, options);
      instance.setFormat(format);
      instance.setModule(new formats[format](options));
      return instance;
    } else {
      throw new Error("create(" + format + "): format not registered");
    }
  };
  vending.registerFormat = function(format, module2) {
    if (formats[format]) {
      throw new Error("register(" + format + "): format already registered");
    }
    if (typeof module2 !== "function") {
      throw new Error("register(" + format + "): format module invalid");
    }
    if (typeof module2.prototype.append !== "function" || typeof module2.prototype.finalize !== "function") {
      throw new Error("register(" + format + "): format module missing methods");
    }
    formats[format] = module2;
  };
  vending.isRegisteredFormat = function(format) {
    if (formats[format]) {
      return true;
    }
    return false;
  };
  vending.registerFormat("zip", require_zip());
  vending.registerFormat("tar", require_tar());
  vending.registerFormat("json", require_json());
  module.exports = vending;
});

// ../../node_modules/.pnpm/commander@12.1.0/node_modules/commander/esm.mjs
var import__ = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  Command,
  Argument,
  Option,
  Help
} = import__.default;

// src/package.ts
var import_archiver = __toESM(require_archiver(), 1);
import * as fs from "fs";
import * as path from "path";
var DEFAULT_HANDLER = "index.handler";
var DEFAULT_RUNTIME = "nodejs20.x";
var DEFAULT_MEMORY = 1024;
var DEFAULT_TIMEOUT = 30;
function getDirectorySize(dir) {
  if (!fs.existsSync(dir))
    return 0;
  let size = 0;
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const fullPath = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        size += fs.statSync(fullPath).size;
      }
    }
  }
  walk(dir);
  return size;
}
function countFiles(dir) {
  if (!fs.existsSync(dir))
    return { count: 0, totalSize: 0, byExt: {} };
  let count = 0;
  let totalSize = 0;
  const byExt = {};
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const fullPath = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        count++;
        totalSize += fs.statSync(fullPath).size;
        const ext = path.extname(entry.name) || "(no ext)";
        byExt[ext] = (byExt[ext] || 0) + 1;
      }
    }
  }
  walk(dir);
  return { count, totalSize, byExt };
}
function getStaticBreakdown(staticDir) {
  if (!fs.existsSync(staticDir))
    return [];
  const breakdown = [];
  for (const entry of fs.readdirSync(staticDir, { withFileTypes: true })) {
    const fullPath = path.join(staticDir, entry.name);
    if (entry.isDirectory()) {
      const stats = countFiles(fullPath);
      if (stats.count > 0) {
        breakdown.push({
          path: entry.name,
          fileCount: stats.count,
          totalSize: stats.totalSize,
          extensions: Object.entries(stats.byExt).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([ext]) => ext)
        });
      }
    } else {
      breakdown.push({
        path: entry.name,
        fileCount: 1,
        totalSize: fs.statSync(fullPath).size,
        extensions: [path.extname(entry.name) || "(no ext)"]
      });
    }
  }
  return breakdown.sort((a, b) => b.fileCount - a.fileCount);
}
function getTopFiles(funcDir) {
  if (!fs.existsSync(funcDir))
    return [];
  const result = [];
  for (const entry of fs.readdirSync(funcDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const count = countFiles(path.join(funcDir, entry.name)).count;
      result.push(`${entry.name}/ (${count} files)`);
    } else {
      result.push(entry.name);
    }
  }
  return result.slice(0, 10);
}
function scanFunction(funcDir, funcName) {
  let handler = DEFAULT_HANDLER;
  let runtime = DEFAULT_RUNTIME;
  let memory = DEFAULT_MEMORY;
  let timeout = DEFAULT_TIMEOUT;
  const vcConfigPath = path.join(funcDir, ".vc-config.json");
  if (fs.existsSync(vcConfigPath)) {
    try {
      const vcConfig = JSON.parse(fs.readFileSync(vcConfigPath, "utf-8"));
      if (vcConfig.runtime)
        runtime = vcConfig.runtime;
      if (vcConfig.handler)
        handler = vcConfig.handler;
      if (vcConfig.memory)
        memory = vcConfig.memory;
      if (vcConfig.maxDuration)
        timeout = vcConfig.maxDuration;
    } catch {}
  }
  let entryFile;
  if (runtime.startsWith("python")) {
    entryFile = "handler.py";
    if (!fs.existsSync(path.join(funcDir, entryFile))) {
      entryFile = "handler.py";
    }
  } else {
    entryFile = "index.js";
    if (!fs.existsSync(path.join(funcDir, entryFile))) {
      if (fs.existsSync(path.join(funcDir, "index.mjs"))) {
        entryFile = "index.mjs";
      }
    }
  }
  return {
    name: funcName,
    entryFile,
    handler,
    runtime,
    memory,
    timeout,
    size: getDirectorySize(funcDir),
    topFiles: getTopFiles(funcDir)
  };
}
async function createZip(configFile, staticDir, functionsDir, envFile) {
  const chunks = [];
  const archive = import_archiver.default("zip", { zlib: { level: 9 } });
  const promise = new Promise((resolve, reject) => {
    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
  });
  if (fs.existsSync(configFile))
    archive.file(configFile, { name: "config.json" });
  if (fs.existsSync(staticDir))
    archive.directory(staticDir, "static");
  if (fs.existsSync(functionsDir))
    archive.directory(functionsDir, "functions");
  if (fs.existsSync(envFile))
    archive.file(envFile, { name: ".env.production" });
  archive.finalize();
  return promise;
}
async function scanAndPackage(outputDir) {
  const configFile = path.join(outputDir, "config.json");
  const staticDir = path.join(outputDir, "static");
  const functionsDir = path.join(outputDir, "functions");
  const envFile = path.join(outputDir, ".env.production");
  let routes = [];
  if (fs.existsSync(configFile)) {
    try {
      const config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
      routes = config.routes || [];
    } catch {}
  }
  const staticStats = countFiles(staticDir);
  const staticBreakdown = getStaticBreakdown(staticDir);
  const functions = [];
  if (fs.existsSync(functionsDir)) {
    for (const name of fs.readdirSync(functionsDir)) {
      const funcPath = path.join(functionsDir, name);
      if (name.endsWith(".func") && fs.statSync(funcPath).isDirectory()) {
        functions.push(scanFunction(funcPath, name));
      }
    }
  }
  let envVars = 0;
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf-8");
    envVars = content.split(`
`).filter((l) => l.trim() && !l.startsWith("#") && l.includes("=")).length;
  }
  const zipBuffer = await createZip(configFile, staticDir, functionsDir, envFile);
  return {
    zipBuffer,
    routes,
    static: {
      totalFiles: staticStats.count,
      totalSize: staticStats.totalSize,
      breakdown: staticBreakdown
    },
    functions,
    envVars
  };
}

// src/validate.ts
import * as fs2 from "fs";
import * as path2 from "path";
async function validatePackage(outputDir) {
  const checks = [];
  const errors = [];
  const configPath = path2.join(outputDir, "config.json");
  if (!fs2.existsSync(configPath)) {
    checks.push({
      name: "config.json exists",
      passed: false,
      message: "config.json not found",
      details: `Expected: ${configPath}

The .rebyte/ directory must contain a config.json file with routes.
Create it manually or use a framework adapter like OpenNext.`
    });
    errors.push("config.json not found in .rebyte/");
    return { valid: false, checks, errors };
  }
  checks.push({ name: "config.json exists", passed: true, message: "Found" });
  let config;
  try {
    config = JSON.parse(fs2.readFileSync(configPath, "utf-8"));
  } catch (err) {
    const parseError = err;
    checks.push({
      name: "config.json valid JSON",
      passed: false,
      message: "Invalid JSON",
      details: `Parse error: ${parseError.message}

Fix the JSON syntax in config.json.`
    });
    errors.push(`config.json is not valid JSON: ${parseError.message}`);
    return { valid: false, checks, errors };
  }
  checks.push({ name: "config.json valid JSON", passed: true, message: "Valid" });
  if (!config.routes || !Array.isArray(config.routes) || config.routes.length === 0) {
    checks.push({
      name: "Routes defined",
      passed: false,
      message: "No routes",
      details: `config.json must have a "routes" array.

Example for static site:
{
  "version": 1,
  "routes": [
    { "handle": "filesystem" }
  ]
}

Example for SSR:
{
  "version": 1,
  "routes": [
    { "handle": "filesystem" },
    { "src": "^/(.*)$", "dest": "/functions/default" }
  ]
}`
    });
    errors.push("config.json has no routes defined");
    return { valid: false, checks, errors };
  }
  checks.push({ name: "Routes defined", passed: true, message: `${config.routes.length} routes` });
  const functionsDir = path2.join(outputDir, "functions");
  const functionRoutes = config.routes.filter((r) => r.dest?.startsWith("/functions/"));
  for (const route of functionRoutes) {
    const funcName = route.dest.replace("/functions/", "");
    const funcDir = path2.join(functionsDir, `${funcName}.func`);
    if (!fs2.existsSync(funcDir)) {
      checks.push({
        name: `Function ${funcName}`,
        passed: false,
        message: "Directory not found",
        details: `Route "${route.src}" points to /functions/${funcName}
but ${funcDir} does not exist.

Create the function directory with the appropriate entry file.`
      });
      errors.push(`Route "${route.src}" points to /functions/${funcName} but functions/${funcName}.func/ does not exist`);
      continue;
    }
    checks.push({ name: `Function ${funcName}`, passed: true, message: "Directory exists" });
  }
  const staticDir = path2.join(outputDir, "static");
  const hasFilesystemRoute = config.routes.some((r) => r.handle === "filesystem");
  const hasStaticRoutes = config.routes.some((r) => r.dest?.startsWith("/static/"));
  if ((hasFilesystemRoute || hasStaticRoutes) && !fs2.existsSync(staticDir)) {
    checks.push({
      name: "Static directory",
      passed: false,
      message: "Not found",
      details: `Routes reference static files but static/ directory doesn't exist.

Create: ${staticDir}

Or remove the filesystem/static routes if this is a pure SSR app.`
    });
  } else if (fs2.existsSync(staticDir)) {
    const staticCount = countFiles2(staticDir);
    checks.push({ name: "Static directory", passed: true, message: `${staticCount} files` });
  }
  const valid = errors.length === 0;
  return { valid, checks, errors };
}
function countFiles2(dir) {
  if (!fs2.existsSync(dir))
    return 0;
  let count = 0;
  for (const entry of fs2.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFiles2(path2.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}
function formatValidationOutput(result) {
  const lines = [];
  for (const check of result.checks) {
    const icon = check.passed ? "✓" : "✗";
    lines.push(`${icon} ${check.name}: ${check.message}`);
    if (!check.passed && check.details) {
      const detailLines = check.details.split(`
`).map((l) => `    ${l}`);
      lines.push("");
      lines.push(...detailLines);
      lines.push("");
    }
  }
  return lines.join(`
`);
}

// src/build.ts
import { cpSync as cpSync3, existsSync as existsSync5, mkdirSync as mkdirSync3, statSync as statSync2 } from "fs";
import * as path6 from "path";

// src/build-utils.ts
import { execSync } from "child_process";
import {
  cpSync,
  existsSync as existsSync3,
  mkdirSync,
  readFileSync as readFileSync3,
  rmSync,
  writeFileSync
} from "fs";
import * as path3 from "path";
var DEFAULT_VC_CONFIG = {
  runtime: "nodejs20.x",
  handler: "index.handler",
  memory: 1024,
  maxDuration: 30
};
var ESM_CJS_BANNER = `import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);`;
var NATIVE_MODULE_PATTERNS = [
  {
    pattern: /@libsql\/(linux|darwin|win32)-/,
    message: `@libsql/client is importing a native binary driver that does not work on Lambda.
` + `Fix: import from "@libsql/client/http" (or "@libsql/client/web") instead of "@libsql/client".
` + `The Rebyte sqlite addon provides a Turso HTTP URL — use it with the HTTP driver.
` + `Example:
` + `  import { createClient } from "@libsql/client/http";
` + `  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });`
  },
  {
    pattern: /better-sqlite3/,
    message: `better-sqlite3 is a native C++ addon that does not work on Lambda.
` + `Fix: use @libsql/client/http with a Turso database instead.
` + `The Rebyte sqlite addon provisions a Turso database automatically.`
  },
  {
    pattern: /require\(["']sqlite3["']\)/,
    message: `node-sqlite3 is a native addon that does not work on Lambda.
` + `Fix: use @libsql/client/http with a Turso database instead.`
  }
];
function exec(cmd, cwd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}
function fileExists(dir, ...names) {
  return names.some((n) => existsSync3(path3.join(dir, n)));
}
function readPackageJson(dir) {
  const p = path3.join(dir, "package.json");
  if (!existsSync3(p))
    return null;
  return JSON.parse(readFileSync3(p, "utf-8"));
}
function hasDep(pkg, name) {
  const deps = pkg.dependencies ?? {};
  const devDeps = pkg.devDependencies ?? {};
  return name in deps || name in devDeps;
}
function ensureDep(projectDir, pkg) {
  const pkgDir = path3.join(projectDir, "node_modules", ...pkg.split("/"));
  if (existsSync3(pkgDir))
    return;
  console.log(`Installing ${pkg}...`);
  exec(`npm install --save-dev ${pkg}`, projectDir);
}
function prepareOutputDir(projectDir) {
  const outputDir = path3.join(projectDir, ".rebyte");
  const funcDir = path3.join(outputDir, "functions", "default.func");
  if (existsSync3(outputDir)) {
    rmSync(outputDir, { recursive: true });
  }
  mkdirSync(path3.join(outputDir, "static"), { recursive: true });
  return { outputDir, funcDir };
}
function writeConfig(outputDir, config) {
  writeFileSync(path3.join(outputDir, "config.json"), JSON.stringify(config, null, 2));
  console.log("Created: .rebyte/config.json");
}
function writeVcConfig(funcDir, config = DEFAULT_VC_CONFIG) {
  writeFileSync(path3.join(funcDir, ".vc-config.json"), JSON.stringify(config, null, 2));
  console.log("Created: .rebyte/functions/default.func/.vc-config.json");
}
function copyDir(src, dest, label) {
  if (!existsSync3(src)) {
    throw new Error(`Directory not found: ${src}

` + `The build step should have created this directory. Possible causes:
` + `- The build command failed silently (check output above)
` + `- The "output" path in rebyte.json is wrong
` + `- The framework build outputs to a different directory than expected

` + `List the project directory to find the actual build output, then update rebyte.json accordingly.`);
  }
  cpSync(src, dest, { recursive: true });
  console.log(`Copied ${label}`);
}
function readRebyteConfig(projectDir) {
  const configPath = path3.join(projectDir, "rebyte.json");
  if (!existsSync3(configPath))
    return null;
  let raw;
  try {
    raw = JSON.parse(readFileSync3(configPath, "utf-8"));
  } catch (err) {
    throw new Error(`rebyte.json is not valid JSON: ${err.message}

` + `Fix the JSON syntax in ${configPath}.`);
  }
  if (!raw.static && !raw.functions) {
    throw new Error(`rebyte.json must define at least "static" or "functions".

` + `Example for a static site:
` + `  { "static": { "build": "npm run build", "output": "dist/" } }

` + `Example for an API:
` + `  { "functions": { "default": { "runtime": "nodejs20.x", "handler": "index.handler", "output": "dist/" } } }`);
  }
  if (raw.static && !raw.static.output) {
    throw new Error(`rebyte.json: static.output is required.

` + `Set it to the directory containing your built static files.
` + `Example: { "static": { "build": "npm run build", "output": "dist/" } }`);
  }
  if (raw.functions) {
    for (const [name, func] of Object.entries(raw.functions)) {
      if (!func.runtime) {
        throw new Error(`rebyte.json: functions.${name}.runtime is required.

` + `Valid runtimes: "nodejs20.x", "python3.12", "provided.al2023" (Go/Rust).
` + `Example: { "runtime": "nodejs20.x" }`);
      }
      if (!func.handler) {
        throw new Error(`rebyte.json: functions.${name}.handler is required.

` + `This is the Lambda entry point.
` + `Node.js: "index.handler", Python: "handler.handler", Go/Rust: "bootstrap".`);
      }
      if (!func.output) {
        throw new Error(`rebyte.json: functions.${name}.output is required.

` + `Set it to the build output file or directory.
` + `Node.js: "dist/", Python: ".", Go/Rust: "bootstrap".`);
      }
    }
  }
  return raw;
}
function esbuild(projectDir, args) {
  exec(`npx esbuild ${args}`, projectDir);
}
function validateBundle(bundlePath) {
  const content = readFileSync3(bundlePath, "utf-8");
  for (const { pattern, message } of NATIVE_MODULE_PATTERNS) {
    if (pattern.test(content)) {
      throw new Error(`
========== BUILD ERROR: Native module detected ==========

` + `${message}

` + `Lambda only supports pure JavaScript/WASM — native .node binaries cannot be deployed.
` + `==========================================================
`);
    }
  }
}
function ssrRoutes(staticAssetPrefix) {
  return [
    {
      src: `^/${staticAssetPrefix}/(.*)$`,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      continue: true
    },
    { src: "^/api/(.*)$", dest: "/functions/default" },
    { handle: "filesystem" },
    { src: "^/(.*)$", dest: "/functions/default" }
  ];
}
function detectAddons(projectDir) {
  const addons = [];
  const pkg = readPackageJson(projectDir);
  if (pkg) {
    if (hasDep(pkg, "@libsql/client"))
      addons.push("sqlite");
    if (hasDep(pkg, "@aws-sdk/client-dynamodb") || hasDep(pkg, "@aws-sdk/lib-dynamodb")) {
      addons.push("dynamodb");
    }
  }
  const envPath = path3.join(projectDir, ".env.production");
  if (existsSync3(envPath)) {
    const envContent = readFileSync3(envPath, "utf-8");
    if (envContent.includes("REBYTE_AI_GATEWAY_URL")) {
      addons.push("ai-gateway");
    }
  }
  return addons;
}
function injectAddons(outputDir, addons) {
  if (addons.length === 0)
    return;
  const configPath = path3.join(outputDir, "config.json");
  const config = JSON.parse(readFileSync3(configPath, "utf-8"));
  config.addons = addons;
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Addons detected: ${addons.join(", ")}`);
}

// src/build-nodejs.ts
import {
  existsSync as existsSync4,
  mkdirSync as mkdirSync2,
  readFileSync as readFileSync4,
  writeFileSync as writeFileSync2,
  rmSync as rmSync2
} from "fs";
import * as path4 from "path";
function ensureOpenNextConfig(projectDir) {
  const configPath = path4.join(projectDir, "open-next.config.ts");
  if (existsSync4(configPath))
    return;
  const config = `import type { OpenNextConfig } from "@opennextjs/aws/types/open-next";

const config: OpenNextConfig = {
  buildCommand: "npx next build",
  default: {
    override: {
      wrapper: "aws-lambda",
      converter: "aws-apigw-v2",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;
`;
  writeFileSync2(configPath, config);
  console.log("Generated open-next.config.ts");
}
function ensureNextConfig(projectDir) {
  for (const name of ["next.config.ts", "next.config.mjs", "next.config.js"]) {
    const configPath = path4.join(projectDir, name);
    if (!existsSync4(configPath))
      continue;
    const content = readFileSync4(configPath, "utf-8");
    if (!content.includes("standalone")) {
      const patched = content.replace(/({[\s\S]*?)(};?\s*$)/m, (_match, before, after) => {
        const indent = "  ";
        const insertion = `${indent}output: 'standalone',
${indent}images: { unoptimized: true },
`;
        return `${before}${insertion}${after}`;
      });
      if (patched !== content) {
        writeFileSync2(configPath, patched);
        console.log(`Patched ${name}: added output: 'standalone' and images.unoptimized`);
      } else {
        console.warn(`Warning: Could not auto-patch ${name}. Manually add output: 'standalone'.`);
      }
    }
    return;
  }
}
function ensureSvelteKitAdapter(projectDir) {
  const configPath = path4.join(projectDir, "svelte.config.js");
  if (!existsSync4(configPath)) {
    writeFileSync2(configPath, `import adapter from 'svelte-kit-sst';

export default { kit: { adapter: adapter() } };
`);
    console.log("Created svelte.config.js with svelte-kit-sst adapter");
    return;
  }
  const content = readFileSync4(configPath, "utf-8");
  if (content.includes("svelte-kit-sst"))
    return;
  const patched = content.replace(/import\s+adapter\s+from\s+['"][^'"]+['"]/, `import adapter from 'svelte-kit-sst'`).replace(/adapter\s*:\s*adapter\s*\([^)]*\)/, "adapter: adapter()");
  if (patched !== content) {
    writeFileSync2(configPath, patched);
    console.log("Patched svelte.config.js: switched to svelte-kit-sst adapter");
  } else {
    console.warn("Warning: Could not auto-patch svelte.config.js. Overwriting with svelte-kit-sst adapter.");
    writeFileSync2(configPath, `import adapter from 'svelte-kit-sst';

export default { kit: { adapter: adapter() } };
`);
  }
}
function packageNextjs(projectDir, outputDir, funcDir) {
  mkdirSync2(funcDir, { recursive: true });
  const openNextDir = path4.join(projectDir, ".open-next");
  copyDir(path4.join(openNextDir, "assets"), path4.join(outputDir, "static"), "static assets");
  copyDir(path4.join(openNextDir, "server-functions", "default"), funcDir, "server function");
  const nextBundle = path4.join(funcDir, "index.mjs");
  if (existsSync4(nextBundle))
    validateBundle(nextBundle);
  writeVcConfig(funcDir);
  writeConfig(outputDir, {
    version: 1,
    framework: { name: "nextjs" },
    routes: ssrRoutes("_next/static")
  });
}
function packageNuxt(projectDir, outputDir, funcDir) {
  mkdirSync2(funcDir, { recursive: true });
  const nitroOutput = path4.join(projectDir, ".output");
  copyDir(path4.join(nitroOutput, "public"), path4.join(outputDir, "static"), "static assets");
  copyDir(path4.join(nitroOutput, "server"), funcDir, "server function");
  writeFileSync2(path4.join(funcDir, "index.js"), `export { handler } from './index.mjs';`);
  console.log("Created index.js wrapper");
  const nitroBundle = path4.join(funcDir, "index.mjs");
  if (existsSync4(nitroBundle))
    validateBundle(nitroBundle);
  writeVcConfig(funcDir);
  writeConfig(outputDir, {
    version: 1,
    framework: { name: "nuxt" },
    routes: ssrRoutes("_nuxt")
  });
}
function packageRemix(projectDir, outputDir, funcDir) {
  mkdirSync2(funcDir, { recursive: true });
  const buildDir = path4.join(projectDir, "build");
  const clientDir = path4.join(buildDir, "client");
  const serverDir = path4.join(buildDir, "server");
  if (!existsSync4(serverDir)) {
    throw new Error("build/server not found. Remix build may have failed.");
  }
  if (existsSync4(clientDir)) {
    copyDir(clientDir, path4.join(outputDir, "static"), "static assets");
  }
  const entryPoint = path4.join(funcDir, "_entry.js");
  const serverIndexPath = path4.join(serverDir, "index.js").replace(/\\/g, "/");
  writeFileSync2(entryPoint, `import { createRequestHandler } from '@remix-run/node';
import * as build from '${serverIndexPath}';

const remixHandler = createRequestHandler(build, 'production');

// CloudFront read-only headers that must NOT appear in Lambda responses
const RESTRICTED = new Set([
  'connection', 'expect', 'keep-alive', 'proxy-authenticate',
  'proxy-authorization', 'proxy-connection', 'trailer', 'upgrade',
  'x-accel-buffering', 'x-accel-charset', 'x-accel-limit-rate',
  'x-accel-redirect', 'x-cache', 'x-forwarded-proto', 'x-real-ip',
  'transfer-encoding', 'via', 'content-length',
]);

export async function handler(event) {
  // API Gateway v2 event -> Web Fetch Request
  const { requestContext, rawPath, rawQueryString, headers: evtHeaders, body, isBase64Encoded, cookies } = event;
  const url = 'https://' + requestContext.domainName + rawPath + (rawQueryString ? '?' + rawQueryString : '');

  const headers = new Headers();
  if (evtHeaders) Object.entries(evtHeaders).forEach(([k, v]) => headers.set(k, v));
  if (cookies) headers.set('cookie', cookies.join('; '));

  const method = requestContext.http.method || 'GET';
  const request = new Request(url, {
    method,
    headers,
    body: method !== 'GET' && method !== 'HEAD'
      ? (isBase64Encoded ? Buffer.from(body || '', 'base64') : body)
      : undefined,
  });

  // Call Remix
  const response = await remixHandler(request);

  // Web Fetch Response -> API Gateway v2 response
  const respHeaders = {};
  const setCookies = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie() : [];

  response.headers.forEach((v, k) => {
    const lower = k.toLowerCase();
    if (RESTRICTED.has(lower) || lower === 'set-cookie') return;
    respHeaders[k] = v;
  });

  // Detect binary content for base64 encoding
  const ct = response.headers.get('content-type') || '';
  const isText = ct.startsWith('text/') || ct.includes('json') || ct.includes('xml')
    || ct.includes('javascript') || ct.includes('css') || ct.includes('html');

  let respBody;
  let base64 = false;
  if (isText || !ct) {
    respBody = await response.text();
  } else {
    const buf = await response.arrayBuffer();
    respBody = Buffer.from(buf).toString('base64');
    base64 = true;
  }

  const result = { statusCode: response.status, headers: respHeaders, body: respBody, isBase64Encoded: base64 };
  if (setCookies.length > 0) result.cookies = setCookies;
  return result;
}
`);
  console.log("Bundling with esbuild...");
  const outfile = path4.join(funcDir, "index.mjs");
  esbuild(projectDir, `"${entryPoint}" --bundle --platform=node --target=node20 --format=esm ` + `--outfile="${outfile}" --external:@aws-sdk/* --minify=false ` + `--banner:js="${ESM_CJS_BANNER}"`);
  rmSync2(entryPoint);
  console.log("Bundled Lambda handler");
  writeFileSync2(path4.join(funcDir, "index.js"), `export { handler } from './index.mjs';`);
  console.log("Created index.js wrapper");
  validateBundle(outfile);
  writeVcConfig(funcDir);
  writeConfig(outputDir, {
    version: 1,
    framework: { name: "remix" },
    routes: ssrRoutes("assets")
  });
}
function packageSveltekit(projectDir, outputDir, funcDir) {
  mkdirSync2(funcDir, { recursive: true });
  const sstOutput = path4.join(projectDir, ".svelte-kit", "svelte-kit-sst");
  const clientDir = path4.join(sstOutput, "client");
  const serverDir = path4.join(sstOutput, "server");
  if (!existsSync4(serverDir)) {
    throw new Error(".svelte-kit/svelte-kit-sst/server not found. SvelteKit build may have failed.");
  }
  if (existsSync4(clientDir)) {
    copyDir(clientDir, path4.join(outputDir, "static"), "static assets");
  }
  console.log("Bundling with esbuild...");
  const entryPoint = path4.join(serverDir, "lambda-handler", "index.js");
  const outfile = path4.join(funcDir, "index.mjs");
  esbuild(projectDir, `"${entryPoint}" --bundle --platform=node --target=node20 --format=esm ` + `--outfile="${outfile}" --minify=false ` + `--banner:js="${ESM_CJS_BANNER}"`);
  console.log("Bundled Lambda handler");
  writeFileSync2(path4.join(funcDir, "index.js"), `export { handler } from './index.mjs';`);
  console.log("Created index.js wrapper");
  validateBundle(outfile);
  writeVcConfig(funcDir);
  writeConfig(outputDir, {
    version: 1,
    framework: { name: "sveltekit" },
    routes: ssrRoutes("_app")
  });
}

// src/build-static.ts
import {
  cpSync as cpSync2,
  readdirSync as readdirSync3
} from "fs";
import * as path5 from "path";
function packageVite(projectDir, outputDir) {
  const distDir = path5.join(projectDir, "dist");
  copyDir(distDir, path5.join(outputDir, "static"), "static assets");
  writeConfig(outputDir, {
    version: 1,
    framework: { name: "vite" },
    routes: [
      { handle: "filesystem" },
      { src: "^/(.*)$", dest: "/index.html" }
    ]
  });
}
function packageAstro(projectDir, outputDir) {
  const distDir = path5.join(projectDir, "dist");
  copyDir(distDir, path5.join(outputDir, "static"), "static assets");
  writeConfig(outputDir, {
    version: 1,
    framework: { name: "astro" },
    routes: [{ handle: "filesystem" }]
  });
}
function packageGatsby(projectDir, outputDir) {
  const publicDir = path5.join(projectDir, "public");
  copyDir(publicDir, path5.join(outputDir, "static"), "static assets");
  writeConfig(outputDir, {
    version: 1,
    framework: { name: "gatsby" },
    routes: [{ handle: "filesystem" }]
  });
}
function packageCra(projectDir, outputDir) {
  const buildDir = path5.join(projectDir, "build");
  copyDir(buildDir, path5.join(outputDir, "static"), "static assets");
  writeConfig(outputDir, {
    version: 1,
    framework: { name: "cra" },
    routes: [
      { handle: "filesystem" },
      { src: "^/(.*)$", dest: "/index.html" }
    ]
  });
}
function packageStaticHtml(projectDir, outputDir) {
  const exclude = new Set([
    "scripts",
    "node_modules",
    ".rebyte",
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    ".git",
    ".gitignore"
  ]);
  for (const entry of readdirSync3(projectDir)) {
    if (exclude.has(entry))
      continue;
    const src = path5.join(projectDir, entry);
    const dest = path5.join(outputDir, "static", entry);
    cpSync2(src, dest, { recursive: true });
    console.log(`Copied: ${entry}`);
  }
  writeConfig(outputDir, {
    version: 1,
    routes: [{ handle: "filesystem" }]
  });
}

// src/build.ts
function detectFramework(projectDir) {
  const pkg = readPackageJson(projectDir);
  if (fileExists(projectDir, "next.config.js", "next.config.mjs", "next.config.ts")) {
    return "nextjs";
  }
  if (fileExists(projectDir, "nuxt.config.js", "nuxt.config.ts")) {
    return "nuxt";
  }
  if (fileExists(projectDir, "remix.config.js", "remix.config.ts")) {
    return "remix";
  }
  if (pkg && hasDep(pkg, "@remix-run/dev")) {
    return "remix";
  }
  if (fileExists(projectDir, "svelte.config.js")) {
    return "sveltekit";
  }
  if (fileExists(projectDir, "astro.config.mjs", "astro.config.ts")) {
    return "astro";
  }
  if (fileExists(projectDir, "gatsby-config.js", "gatsby-config.ts")) {
    return "gatsby";
  }
  if (pkg && hasDep(pkg, "react-scripts")) {
    return "cra";
  }
  if (fileExists(projectDir, "vite.config.js", "vite.config.ts", "vite.config.mjs")) {
    return "vite";
  }
  if (pkg && hasDep(pkg, "vite")) {
    return "vite";
  }
  if (existsSync5(path6.join(projectDir, "index.html"))) {
    return "static-html";
  }
  throw new Error(`Could not auto-detect framework in: ${projectDir}

` + `Auto-detection looks for: next.config.*, nuxt.config.*, remix.config.*, svelte.config.js,
` + `astro.config.*, gatsby-config.*, vite.config.*, react-scripts in package.json, or index.html.

` + `How to fix:
` + `1. If this is a Node.js/static project, ensure you have the framework config file and package.json.
` + `2. For Python, Go, Rust, or any other language, create a rebyte.json file. Example:
` + `   { "static": { "build": "npm run build", "output": "dist/" } }
` + `   See the rebyte-app-builder skill docs (core/rebyte-json.md) for the full schema.
` + `3. Or create .rebyte/ manually and run "rebyte deploy" directly.`);
}
function runBuild(projectDir, framework) {
  switch (framework) {
    case "nextjs":
      ensureNextConfig(projectDir);
      ensureOpenNextConfig(projectDir);
      ensureDep(projectDir, "@opennextjs/aws");
      exec("npx @opennextjs/aws build", projectDir);
      break;
    case "nuxt":
      exec("NITRO_PRESET=aws-lambda npx nuxi build", projectDir);
      break;
    case "remix":
      ensureDep(projectDir, "@remix-run/node");
      exec("npx remix vite:build", projectDir);
      break;
    case "sveltekit":
      ensureSvelteKitAdapter(projectDir);
      ensureDep(projectDir, "svelte-kit-sst");
      exec("npx vite build", projectDir);
      break;
    case "astro":
      exec("npx astro build", projectDir);
      break;
    case "gatsby":
      exec("npx gatsby build", projectDir);
      break;
    case "vite":
      exec("npx vite build", projectDir);
      break;
    case "cra":
      exec("npx react-scripts build", projectDir);
      break;
    case "static-html":
      break;
  }
}
function buildFromConfig(projectDir, config) {
  const { outputDir } = prepareOutputDir(projectDir);
  if (config.static) {
    const staticSrcDir = path6.resolve(projectDir, config.static.path ?? ".");
    if (config.static.build) {
      console.log(`
Building static assets...`);
      exec(config.static.build, staticSrcDir);
    }
    const staticOutputDir = path6.resolve(staticSrcDir, config.static.output);
    copyDir(staticOutputDir, path6.join(outputDir, "static"), "static assets");
  }
  if (config.functions) {
    for (const [name, func] of Object.entries(config.functions)) {
      console.log(`
Building function: ${name}...`);
      const funcSrcDir = path6.resolve(projectDir, func.path ?? ".");
      const funcDestDir = path6.join(outputDir, "functions", `${name}.func`);
      mkdirSync3(funcDestDir, { recursive: true });
      if (func.build) {
        exec(func.build, funcSrcDir);
      }
      const outputPath = path6.resolve(funcSrcDir, func.output);
      if (!existsSync5(outputPath)) {
        throw new Error(`Function "${name}" output not found: ${outputPath}

` + `The build command should have created this file or directory.
` + `Check that:
` + `- The "build" command in rebyte.json ran successfully (check output above)
` + `- The "output" field points to the correct path relative to "path" (currently: "${func.output}")
` + `- For Go/Rust: the compiled binary name matches the output field
` + `- For Python: the directory with installed deps exists

` + `List the contents of ${funcSrcDir} to find the actual output.`);
      }
      if (statSync2(outputPath).isDirectory()) {
        copyDir(outputPath, funcDestDir, `function ${name}`);
      } else {
        cpSync3(outputPath, path6.join(funcDestDir, path6.basename(func.output)));
        console.log(`Copied function ${name}`);
      }
      writeVcConfig(funcDestDir, {
        runtime: func.runtime,
        handler: func.handler,
        memory: func.memory ?? 1024,
        maxDuration: func.maxDuration ?? 30
      });
    }
  }
  const routes = config.routes ?? generateDefaultRoutes(config);
  writeConfig(outputDir, {
    version: 1,
    routes,
    addons: config.addons
  });
  const detectedAddons = detectAddons(projectDir);
  if (detectedAddons.length > 0) {
    injectAddons(outputDir, detectedAddons);
  }
  const envSrc = path6.join(projectDir, ".env.production");
  if (existsSync5(envSrc)) {
    cpSync3(envSrc, path6.join(outputDir, ".env.production"));
    console.log("Copied .env.production");
  }
  return outputDir;
}
function generateDefaultRoutes(config) {
  const hasFunctions = config.functions && Object.keys(config.functions).length > 0;
  if (!hasFunctions) {
    return [{ handle: "filesystem" }];
  }
  const funcNames = Object.keys(config.functions);
  const defaultFunc = funcNames.includes("default") ? "default" : funcNames[0];
  return [
    { handle: "filesystem" },
    { src: "^/(.*)$", dest: `/functions/${defaultFunc}` }
  ];
}
async function buildProject(projectDir, options) {
  if (!options?.framework) {
    const rebyteConfig = readRebyteConfig(projectDir);
    if (rebyteConfig) {
      console.log("Found rebyte.json — using explicit config");
      const outputDir2 = buildFromConfig(projectDir, rebyteConfig);
      console.log(`
Build complete!`);
      return { outputDir: outputDir2 };
    }
  }
  const framework = options?.framework ?? detectFramework(projectDir);
  console.log(`Detected framework: ${framework}`);
  console.log(`
Building...`);
  runBuild(projectDir, framework);
  console.log(`
Packaging into .rebyte/...`);
  const { outputDir, funcDir } = prepareOutputDir(projectDir);
  switch (framework) {
    case "nextjs":
      packageNextjs(projectDir, outputDir, funcDir);
      break;
    case "nuxt":
      packageNuxt(projectDir, outputDir, funcDir);
      break;
    case "remix":
      packageRemix(projectDir, outputDir, funcDir);
      break;
    case "sveltekit":
      packageSveltekit(projectDir, outputDir, funcDir);
      break;
    case "vite":
      packageVite(projectDir, outputDir);
      break;
    case "astro":
      packageAstro(projectDir, outputDir);
      break;
    case "gatsby":
      packageGatsby(projectDir, outputDir);
      break;
    case "cra":
      packageCra(projectDir, outputDir);
      break;
    case "static-html":
      packageStaticHtml(projectDir, outputDir);
      break;
  }
  const addons = detectAddons(projectDir);
  injectAddons(outputDir, addons);
  const envSrc = path6.join(projectDir, ".env.production");
  if (existsSync5(envSrc)) {
    cpSync3(envSrc, path6.join(outputDir, ".env.production"));
    console.log("Copied .env.production");
  }
  return { framework, outputDir };
}

// src/cli.ts
import * as path7 from "path";
import * as fs3 from "fs";
import * as os from "os";
var VERSION = "0.5.0";
function getAuthCredentials() {
  let apiUrl = process.env.REBYTE_API_URL || "https://api.rebyte.ai";
  let apiToken = null;
  const authJsonPath = path7.join(os.homedir(), ".rebyte.ai", "auth.json");
  try {
    if (fs3.existsSync(authJsonPath)) {
      const authData = JSON.parse(fs3.readFileSync(authJsonPath, "utf-8"));
      if (authData.sandbox?.token)
        apiToken = authData.sandbox.token;
      if (authData.sandbox?.relay_url)
        apiUrl = authData.sandbox.relay_url;
    }
  } catch {}
  if (!apiToken && process.env.REBYTE_API_TOKEN) {
    apiToken = process.env.REBYTE_API_TOKEN;
  }
  return { apiUrl, apiToken };
}
function parseCreateResponse(text) {
  const data = JSON.parse(text);
  if (!data.deployId || !data.uploadUrl) {
    throw new Error(`Invalid create response: ${text}`);
  }
  return { deployId: data.deployId, uploadUrl: data.uploadUrl };
}
async function uploadZip(uploadUrl, zipBuffer) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/zip" },
    body: zipBuffer
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to upload: ${text}`);
  }
}
async function callRelayApi(apiUrl, apiToken, operation, body = {}) {
  const response = await fetch(`${apiUrl}/api/data/deployments/${operation}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text);
  }
  return text;
}
function resolveProjectDir() {
  const cwd = process.cwd();
  const markers = ["rebyte.json", "package.json", "index.html", "requirements.txt", "pyproject.toml", "go.mod", "Cargo.toml"];
  if (markers.some((m) => fs3.existsSync(path7.join(cwd, m)))) {
    return cwd;
  }
  throw new Error(`No project found in ${cwd}

` + `Expected one of: ${markers.join(", ")}

` + `cd into your project directory first, or use --dir <path>.`);
}
program.name("rebyte").description("Deploy to Rebyte Cloud").version(VERSION);
program.command("build").description("Detect framework, build project, and create .rebyte/ directory").option("-d, --dir <path>", "Project directory").option("--framework <name>", "Override framework detection").action(async (options) => {
  try {
    const projectDir = path7.resolve(options.dir ?? resolveProjectDir());
    const result = await buildProject(projectDir, {
      framework: options.framework
    });
    if (result.framework) {
      console.log(`
Build complete! Framework: ${result.framework}`);
    } else {
      console.log(`
Build complete! (via rebyte.json)`);
    }
    console.log(`Output: ${result.outputDir}`);
    console.log(`
Run 'rebyte deploy' to deploy.`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
});
program.command("deploy").description("Deploy .rebyte/ directory to Rebyte Cloud").option("-d, --dir <path>", "Project directory").option("-n, --name <name>", "Deployment name (for multiple deployments per workspace)").option("--skip-validation", "Skip local validation").action(async (options) => {
  try {
    const projectDir = path7.resolve(options.dir ?? resolveProjectDir());
    const outputDir = path7.join(projectDir, ".rebyte");
    if (!fs3.existsSync(outputDir)) {
      console.error(`.rebyte/ directory not found in ${projectDir}

` + `The .rebyte/ directory is the build output that gets deployed.

` + `How to fix:
` + `1. Run "rebyte build" first to generate it:
` + `     node $SKILL_DIR/bin/rebyte.js build
` + `     node $SKILL_DIR/bin/rebyte.js deploy
` + `2. Or create .rebyte/ manually with config.json and static/ directory.
` + `   See the rebyte-app-builder skill docs (core/package.md) for the structure.`);
      process.exit(1);
    }
    if (!options.skipValidation) {
      const validation = await validatePackage(outputDir);
      if (!validation.valid) {
        console.log(formatValidationOutput(validation));
        console.error(`
Validation failed. The .rebyte/ directory has structural errors.

` + `Fix the errors listed above, then run "rebyte deploy" again.
` + `To skip validation: node $SKILL_DIR/bin/rebyte.js deploy --skip-validation`);
        process.exit(1);
      }
    }
    const auth = getAuthCredentials();
    if (!auth.apiToken) {
      console.error(`No API token found.

` + `The token is normally auto-configured in Rebyte Cloud VMs via ~/.rebyte.ai/auth.json.
` + `If you see this error, the VM may not be properly authenticated.

` + `To fix: set the REBYTE_API_TOKEN environment variable, or ensure ~/.rebyte.ai/auth.json exists.`);
      process.exit(1);
    }
    const pkg = await scanAndPackage(outputDir);
    const body = {};
    if (options.name)
      body.prefix = options.name;
    const createResponse = await callRelayApi(auth.apiUrl, auth.apiToken, "create", body);
    const { deployId, uploadUrl } = parseCreateResponse(createResponse);
    await uploadZip(uploadUrl, pkg.zipBuffer);
    const result = await callRelayApi(auth.apiUrl, auth.apiToken, "update", { deployId });
    console.log(result);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
});
program.command("info").description("Get deployment status").option("-n, --name <name>", "Deployment name").action(async (options) => {
  try {
    const auth = getAuthCredentials();
    if (!auth.apiToken) {
      console.error("Error: No API token.");
      process.exit(1);
    }
    const body = {};
    if (options.name)
      body.prefix = options.name;
    const result = await callRelayApi(auth.apiUrl, auth.apiToken, "status", body);
    console.log(result);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
});
program.command("logs").description("Get Lambda logs").option("-n, --name <name>", "Deployment name").option("-m, --minutes <number>", "Time range in minutes", "5").option("-l, --level <level>", "Filter by log level (INFO, WARN, ERROR, DEBUG)").action(async (options) => {
  try {
    const auth = getAuthCredentials();
    if (!auth.apiToken) {
      console.error("Error: No API token.");
      process.exit(1);
    }
    const body = {
      minutes: parseInt(options.minutes, 10) || 5
    };
    if (options.name)
      body.prefix = options.name;
    if (options.level)
      body.level = options.level.toUpperCase();
    const result = await callRelayApi(auth.apiUrl, auth.apiToken, "logs", body);
    console.log(result);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
});
program.command("delete").description("Delete deployment").option("-n, --name <name>", "Deployment name").option("--confirm", "Confirm deletion").option("--with-data", "Also delete all addon data (SQLite, DynamoDB)").action(async (options) => {
  try {
    const auth = getAuthCredentials();
    if (!auth.apiToken) {
      console.error("Error: No API token.");
      process.exit(1);
    }
    const body = {};
    if (options.name)
      body.prefix = options.name;
    if (!options.confirm) {
      body.dryRun = true;
      const result2 = await callRelayApi(auth.apiUrl, auth.apiToken, "delete", body);
      console.log(result2);
      console.log("");
      console.log("Run with --confirm to delete.");
      if (!options.withData) {
        console.log("Add --with-data to also delete addon data.");
      }
      return;
    }
    if (options.withData) {
      body.withData = true;
    }
    const result = await callRelayApi(auth.apiUrl, auth.apiToken, "delete", body);
    console.log(result);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
});
var addon = program.command("addon").description("Manage deployment addons");
addon.command("list").description("List addon status").option("-n, --name <name>", "Deployment name").action(async (options) => {
  try {
    const auth = getAuthCredentials();
    if (!auth.apiToken) {
      console.error("Error: No API token.");
      process.exit(1);
    }
    const body = {};
    if (options.name)
      body.prefix = options.name;
    const result = await callRelayApi(auth.apiUrl, auth.apiToken, "addon-list", body);
    console.log(result);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
});
addon.command("delete <addon>").description("Delete addon data (sqlite, dynamodb, ai-gateway)").option("-n, --name <name>", "Deployment name").option("--confirm", "Confirm deletion").action(async (addonName, options) => {
  try {
    const auth = getAuthCredentials();
    if (!auth.apiToken) {
      console.error("Error: No API token.");
      process.exit(1);
    }
    const validAddons = ["sqlite", "dynamodb", "ai-gateway"];
    if (!validAddons.includes(addonName)) {
      console.error(`Invalid addon: ${addonName}`);
      console.error(`Valid addons: ${validAddons.join(", ")}`);
      process.exit(1);
    }
    const body = { addon: addonName };
    if (options.name)
      body.prefix = options.name;
    if (!options.confirm) {
      body.dryRun = true;
      const result2 = await callRelayApi(auth.apiUrl, auth.apiToken, "addon-delete", body);
      console.log(result2);
      console.log("");
      console.log("Run with --confirm to delete.");
      return;
    }
    const result = await callRelayApi(auth.apiUrl, auth.apiToken, "addon-delete", body);
    console.log(result);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
});
program.parse();
