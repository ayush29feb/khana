/**
 * @generated SignedSource<<1217fa663f9b1f5b605dcc731e293a64>>
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
    "cacheID": "633e22d508e5ced1b79cac4da034c940",
    "id": null,
    "metadata": {},
    "name": "CatalogViewQuery",
    "operationKind": "query",
    "text": "query CatalogViewQuery {\n  catalog(first: 100) {\n    edges {\n      node {\n        id\n        name\n        brand\n        servingSizeG\n        proteinPerServing\n        carbsPerServing\n        fatPerServing\n        caloriesPerServing\n        healthNotes\n        labelPhotoUrl\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "cc0d7a0111779b942ec92083281793cd";

export default node;
