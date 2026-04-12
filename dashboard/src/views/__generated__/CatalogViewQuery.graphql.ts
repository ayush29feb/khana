/**
 * @generated SignedSource<<a98037e9ebf3384b1332fbde9981784e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type CatalogViewQuery$variables = Record<PropertyKey, never>;
export type CatalogViewQuery$data = {
  readonly catalog: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly brand: string;
        readonly caloriesPerServing: number | null | undefined;
        readonly carbsPerServing: number;
        readonly category: string | null | undefined;
        readonly fatPerServing: number;
        readonly healthNotes: string | null | undefined;
        readonly id: string;
        readonly labelPhotoUrl: string | null | undefined;
        readonly name: string;
        readonly proteinPerServing: number;
        readonly servingSizeG: number;
      };
    }>;
  };
};
export type CatalogViewQuery = {
  response: CatalogViewQuery$data;
  variables: CatalogViewQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "first",
        "value": 100
      }
    ],
    "concreteType": "FoodCatalogItemConnection",
    "kind": "LinkedField",
    "name": "catalog",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "FoodCatalogItemEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "FoodCatalogItem",
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
                "name": "brand",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "servingSizeG",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "proteinPerServing",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "carbsPerServing",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "fatPerServing",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "caloriesPerServing",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "healthNotes",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "labelPhotoUrl",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "category",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "catalog(first:100)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "CatalogViewQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "CatalogViewQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "9f3e294cae1e24d7029b1a871f3d67f1",
    "id": null,
    "metadata": {},
    "name": "CatalogViewQuery",
    "operationKind": "query",
    "text": "query CatalogViewQuery {\n  catalog(first: 100) {\n    edges {\n      node {\n        id\n        name\n        brand\n        servingSizeG\n        proteinPerServing\n        carbsPerServing\n        fatPerServing\n        caloriesPerServing\n        healthNotes\n        labelPhotoUrl\n        category\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8d1c47cf03a127981a8c9740533654d5";

export default node;
