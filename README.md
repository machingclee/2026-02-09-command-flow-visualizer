# Command Flow Visualizer

## Demonstration of the Result


http://event-storming-example.s3-website.ap-northeast-2.amazonaws.com/

<img width="934" height="434" alt="image" src="https://github.com/user-attachments/assets/a92c4fac-ddb5-403b-b596-3649b7a9d5eb" />

## Purpose

There is a metholodogy of managing endpoints in a backend application called ***CQRS***. This suites perfectly to domain driven design because `Command` and `Event` are correct vocabularies to describe an event-based application system.

Based on different implementations on how a command and  a query are dispatched, one can always generate a mapping of `Command`s and `Event`s from the application in the following format:

```ts
interface Commands { 
    commands: {
        commands: Command[];
        policies: { [policyName: string]: PolicyData };
    }
}
```
where
```ts
interface Command {
    from: string; // command name
    to: string[]; // events name
}

// and 

interface PolicyData {
    flows: PolicyFlow[];
}

interface PolicyFlow {
    fromEvent: string | null;
    toCommand: string | null;
    invariant: string;
}
```

For example, a concrete `json` should be like 

```json
{
  "commands": [
    {
      "from": "CreateAIScriptedToolCommand",
      "to": [
        "AIScriptedToolCreatedEvent"
      ]
    },
    {
      "from": "DeleteWorkspaceCommand",
      "to": [
        "WorkspaceDeletedEvent",
        "FolderDeletedEvent",
        "ScriptDeletedEvent"
      ]
    }
  ],
  "policies": {
    "AIProfileDefaultPolicy": {
      "flows": [
        {
          "fromEvent": "AiProfileCreatedEvent",
          "toCommand": "SelectDefaultAiProfileCommand",
          "invariant": "When created, and when there is no default selected profile, the newly created profile should be set to default profile"
        },
        {
          "fromEvent": "ModelConfigDeletedEvent",
          "toCommand": "ResetModelConfigOfAIProfileCommand",
          "invariant": "When a config gets deleted, reset the default ai profile by using an existing config"
        },
        {
          "fromEvent": "ModelConfigCreatedEvent",
          "toCommand": "SelectAiProfileDefaultModelConfigCommand",
          "invariant": "For each aiprofile, any newly created modelconfig should be selected automatically"
        }
      ]
    },
  }
}
```

In short:

- **Command.** Those would change the application state
- **Event.** Those describe a state change has happened
- **Policy.** Those descirbe how an event could create side effect. A policy would listen to an event, and dispatch another command.

  All side effect must take place in policies.


