/**
 * @generated SignedSource<<376005efae74544c3b855671d2961252>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type GoalsViewQuery$variables = Record<PropertyKey, never>;
export type GoalsViewQuery$data = {
  readonly goals: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly dailyBreakdown: ReadonlyArray<{
          readonly calories: number;
          readonly carbs: number;
          readonly date: string;
          readonly fat: number;
          readonly protein: number;
        }>;
        readonly endDate: string;
        readonly id: string;
        readonly name: string;
        readonly pace: {
          readonly calories: {
            readonly actual: number | null | undefined;
            readonly expected: number | null | undefined;
            readonly status: string;
          } | null | undefined;
          readonly protein: {
            readonly actual: number | null | undefined;
            readonly expected: number | null | undefined;
            readonly status: string;
          } | null | undefined;
        };
        readonly progress: {
          readonly calories: number;
          readonly carbs: number;
          readonly fat: number;
          readonly protein: number;
        };
        readonly startDate: string;
        readonly targets: {
          readonly calories: number | null | undefined;
          readonly carbs: number | null | undefined;
          readonly fat: number | null | undefined;
          readonly protein: number | null | undefined;
        };
      };
    }>;
  };
};
export type GoalsViewQuery = {
  response: GoalsViewQuery$data;
  variables: GoalsViewQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "protein",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "carbs",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "fat",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "calories",
  "storageKey": null
},
v4 = [
  (v0/*: any*/),
  (v1/*: any*/),
  (v2/*: any*/),
  (v3/*: any*/)
],
v5 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "expected",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "actual",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "status",
    "storageKey": null
  }
],
v6 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "first",
        "value": 100
      }
    ],
    "concreteType": "GoalConnection",
    "kind": "LinkedField",
    "name": "goals",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "GoalEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Goal",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "startDate",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "endDate",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "MacroTargets",
                "kind": "LinkedField",
                "name": "targets",
                "plural": false,
                "selections": (v4/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "MacroProgress",
                "kind": "LinkedField",
                "name": "progress",
                "plural": false,
                "selections": (v4/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "GoalPace",
                "kind": "LinkedField",
                "name": "pace",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PaceInfo",
                    "kind": "LinkedField",
                    "name": "protein",
                    "plural": false,
                    "selections": (v5/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PaceInfo",
                    "kind": "LinkedField",
                    "name": "calories",
                    "plural": false,
                    "selections": (v5/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "DailyMacros",
                "kind": "LinkedField",
                "name": "dailyBreakdown",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "date",
                    "storageKey": null
                  },
                  (v0/*: any*/),
                  (v1/*: any*/),
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "goals(first:100)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "GoalsViewQuery",
    "selections": (v6/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "GoalsViewQuery",
    "selections": (v6/*: any*/)
  },
  "params": {
    "cacheID": "a1253b64e3bd1043fc14b8c71a7fe532",
    "id": null,
    "metadata": {},
    "name": "GoalsViewQuery",
    "operationKind": "query",
    "text": "query GoalsViewQuery {\n  goals(first: 100) {\n    edges {\n      node {\n        id\n        name\n        startDate\n        endDate\n        targets {\n          protein\n          carbs\n          fat\n          calories\n        }\n        progress {\n          protein\n          carbs\n          fat\n          calories\n        }\n        pace {\n          protein {\n            expected\n            actual\n            status\n          }\n          calories {\n            expected\n            actual\n            status\n          }\n        }\n        dailyBreakdown {\n          date\n          protein\n          carbs\n          fat\n          calories\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "394b51a585bfebc35575f4ea903d9b4e";

export default node;
