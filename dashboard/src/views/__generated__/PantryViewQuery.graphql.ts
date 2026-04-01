/**
 * @generated SignedSource<<502680d1d2bf5743bc07edf5709de291>>
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
          readonly healthNotes: string | null | undefined;
          readonly name: string;
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
                      (v5/*: any*/)
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
      (v6/*: any*/)
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
      (v6/*: any*/)
    ]
  },
  "params": {
    "cacheID": "cd8a573d6fb0e908b42a8cf6e7cbec21",
    "id": null,
    "metadata": {},
    "name": "PantryViewQuery",
    "operationKind": "query",
    "text": "query PantryViewQuery {\n  pantry {\n    edges {\n      node {\n        id\n        servingsRemaining\n        proteinAvailable\n        catalogItem {\n          name\n          brand\n          healthNotes\n          id\n        }\n      }\n    }\n  }\n  pantryProteinTotal\n}\n"
  }
};
})();

(node as any).hash = "965ad7c2b699bef5e80de277c6d23dbc";

export default node;
