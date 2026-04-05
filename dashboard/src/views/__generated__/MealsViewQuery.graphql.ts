/**
 * @generated SignedSource<<fc4aa655aa6c16f184a49b0d57fc98c4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type MealsViewQuery$variables = {
  dateFrom?: string | null | undefined;
  dateTo?: string | null | undefined;
};
export type MealsViewQuery$data = {
  readonly meals: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly calories: number | null | undefined;
        readonly carbsG: number;
        readonly fatG: number;
        readonly id: string;
        readonly ingredients: ReadonlyArray<{
          readonly catalogItem: {
            readonly brand: string;
            readonly caloriesPerServing: number | null | undefined;
            readonly carbsPerServing: number;
            readonly fatPerServing: number;
            readonly name: string;
          };
          readonly proteinContributed: number;
          readonly servingsUsed: number;
        }>;
        readonly isEstimate: boolean;
        readonly loggedAt: string;
        readonly name: string;
        readonly notes: string | null | undefined;
        readonly proteinG: number;
      };
    }>;
  };
};
export type MealsViewQuery = {
  response: MealsViewQuery$data;
  variables: MealsViewQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "dateFrom"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "dateTo"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "dateFrom",
    "variableName": "dateFrom"
  },
  {
    "kind": "Variable",
    "name": "dateTo",
    "variableName": "dateTo"
  },
  {
    "kind": "Literal",
    "name": "first",
    "value": 200
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
  "name": "loggedAt",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "proteinG",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "carbsG",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "fatG",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "calories",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isEstimate",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "notes",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "servingsUsed",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "proteinContributed",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "brand",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "carbsPerServing",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "fatPerServing",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "caloriesPerServing",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "MealsViewQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "MealConnection",
        "kind": "LinkedField",
        "name": "meals",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "MealEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Meal",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "MealIngredient",
                    "kind": "LinkedField",
                    "name": "ingredients",
                    "plural": true,
                    "selections": [
                      (v11/*: any*/),
                      (v12/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "FoodCatalogItem",
                        "kind": "LinkedField",
                        "name": "catalogItem",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          (v13/*: any*/),
                          (v14/*: any*/),
                          (v15/*: any*/),
                          (v16/*: any*/)
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
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "MealsViewQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "MealConnection",
        "kind": "LinkedField",
        "name": "meals",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "MealEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Meal",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "MealIngredient",
                    "kind": "LinkedField",
                    "name": "ingredients",
                    "plural": true,
                    "selections": [
                      (v11/*: any*/),
                      (v12/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "FoodCatalogItem",
                        "kind": "LinkedField",
                        "name": "catalogItem",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          (v13/*: any*/),
                          (v14/*: any*/),
                          (v15/*: any*/),
                          (v16/*: any*/),
                          (v2/*: any*/)
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a51aeed5177d09c2254346a5bb13a623",
    "id": null,
    "metadata": {},
    "name": "MealsViewQuery",
    "operationKind": "query",
    "text": "query MealsViewQuery(\n  $dateFrom: String\n  $dateTo: String\n) {\n  meals(first: 200, dateFrom: $dateFrom, dateTo: $dateTo) {\n    edges {\n      node {\n        id\n        name\n        loggedAt\n        proteinG\n        carbsG\n        fatG\n        calories\n        isEstimate\n        notes\n        ingredients {\n          servingsUsed\n          proteinContributed\n          catalogItem {\n            name\n            brand\n            carbsPerServing\n            fatPerServing\n            caloriesPerServing\n            id\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5cf67d3721dc9a22cd4c84d50aaf43e1";

export default node;
