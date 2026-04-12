/**
 * @generated SignedSource<<15acd201b6e0e5aa9122445aab6e95b4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type PantryViewQuery$variables = Record<PropertyKey, never>;
export type PantryViewQuery$data = {
  readonly pantry: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly catalogItem: {
          readonly brand: string;
          readonly caloriesPerServing: number | null | undefined;
          readonly carbsPerServing: number;
          readonly category: string | null | undefined;
          readonly fatPerServing: number;
          readonly healthNotes: string | null | undefined;
          readonly name: string;
          readonly proteinPerServing: number;
        };
        readonly id: string;
        readonly proteinAvailable: number;
        readonly servingsRemaining: number;
      };
    }>;
  };
  readonly pantryProteinTotal: number;
};
export type PantryViewQuery = {
  response: PantryViewQuery$data;
  variables: PantryViewQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "servingsRemaining",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "proteinAvailable",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "brand",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "healthNotes",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "proteinPerServing",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "carbsPerServing",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "fatPerServing",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "caloriesPerServing",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "category",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pantryProteinTotal",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "PantryViewQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "PantryEntryConnection",
        "kind": "LinkedField",
        "name": "pantry",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PantryEntryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "PantryEntry",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v0/*: any*/),
                  (v1/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FoodCatalogItem",
                    "kind": "LinkedField",
                    "name": "catalogItem",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v4/*: any*/),
                      (v5/*: any*/),
                      (v6/*: any*/),
                      (v7/*: any*/),
                      (v8/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/)
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
        "storageKey": null
      },
      (v11/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "PantryViewQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "PantryEntryConnection",
        "kind": "LinkedField",
        "name": "pantry",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PantryEntryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "PantryEntry",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v0/*: any*/),
                  (v1/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FoodCatalogItem",
                    "kind": "LinkedField",
                    "name": "catalogItem",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v4/*: any*/),
                      (v5/*: any*/),
                      (v6/*: any*/),
                      (v7/*: any*/),
                      (v8/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/),
                      (v0/*: any*/)
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
        "storageKey": null
      },
      (v11/*: any*/)
    ]
  },
  "params": {
    "cacheID": "0b18af7e70d598e6e7e3326ac841c645",
    "id": null,
    "metadata": {},
    "name": "PantryViewQuery",
    "operationKind": "query",
    "text": "query PantryViewQuery {\n  pantry {\n    edges {\n      node {\n        id\n        servingsRemaining\n        proteinAvailable\n        catalogItem {\n          name\n          brand\n          healthNotes\n          proteinPerServing\n          carbsPerServing\n          fatPerServing\n          caloriesPerServing\n          category\n          id\n        }\n      }\n    }\n  }\n  pantryProteinTotal\n}\n"
  }
};
})();

(node as any).hash = "184f0d5280998505dc8dc9f0f5ce5f79";

export default node;
