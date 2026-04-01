/**
 * @generated SignedSource<<cb5c0d29e20e618be713c1d386a010a8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type TrendsViewQuery$variables = Record<PropertyKey, never>;
export type TrendsViewQuery$data = {
  readonly goals: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly endDate: string;
        readonly id: string;
        readonly name: string;
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
export type TrendsViewQuery = {
  response: TrendsViewQuery$data;
  variables: TrendsViewQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "protein",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "carbs",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "fat",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "calories",
    "storageKey": null
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "first",
        "value": 24
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
                "selections": (v0/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "MacroProgress",
                "kind": "LinkedField",
                "name": "progress",
                "plural": false,
                "selections": (v0/*: any*/),
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "goals(first:24)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "TrendsViewQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "TrendsViewQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7ca09675934e009b1d5c288723602a62",
    "id": null,
    "metadata": {},
    "name": "TrendsViewQuery",
    "operationKind": "query",
    "text": "query TrendsViewQuery {\n  goals(first: 24) {\n    edges {\n      node {\n        id\n        name\n        startDate\n        endDate\n        targets {\n          protein\n          carbs\n          fat\n          calories\n        }\n        progress {\n          protein\n          carbs\n          fat\n          calories\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "529c85f7de6679a57a062a3eb4fdc8d9";

export default node;
