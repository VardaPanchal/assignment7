const {
  HttpUtils,
  HttpUtils: { request, successResponse, errorResponse },
} = require("quickwork-adapter-cli-server/http-library");

const app = {
  name: "gumroad",
  alias: "gumroad",
  description: "gumroad",
  version: "1",
  config: {"authType": "oauth_2"},
  webhook_verification_required: false,
  internal: false,
  connection: {
    client_id: "ADD YOUR APPLICATION ID",
    client_secret: "ADD YOUR APPLICATION SECRET",
    redirect_uri: "https://proxy.quickwork.co.in/gumroad/code",
    authorization: {
      type: "oauth_2",
      authorization_url: async connection => {
        let scope = "edit_products";
        let url = `https://gumroad.com/oauth/authorize?client_id=${app.connection.client_id}&redirect_uri=${app.connection.redirect_uri}&scope=${scope}&state=${connection.id}`;
        return { url: url };
      },
      acquire: async (code, scope, state) => {
        try {
          let body = {
            client_id: app.connection.client_id,
            client_secret: app.connection.client_secret,
            grant_type: "authorization_code",
            code,
            redirect_uri: app.connection.redirect_uri,
          };
      
          const encodedCredentials = Buffer.from(`${app.connection.client_id}:${app.connection.client_secret}`).toString('base64');
      
          let tokenURL = "https://gumroad.com/oauth/token";
          let response = await request(
            tokenURL,
            null,
            null,
            HttpUtils.HTTPMethods.POST,
            body,
            HttpUtils.ContentTypes.FORM_URL_ENCODED
          );
      
          if (response.success) {
            let jsonResponse = JSON.parse(response.body);
            console.log(jsonResponse, "jsonResponse");
            
            return successResponse({
              accessToken: jsonResponse.access_token,
              expires: jsonResponse.expires_in,
              refreshToken: jsonResponse.refresh_token,
            
            });
          } else {
            return errorResponse(response.body, response.statusCode);
          }
        } catch (error) {
          return errorResponse(error.message);
        }
      },          
      refresh: async connection => {
        try {
          let body = {
            client_id: app.connection.client_id,
            client_secret: app.connection.client_secret,
            refresh_token: connection.oauthToken.refreshToken,
            grant_type: "refresh_token",
          };
          console.log(body, "body in refresh");
          
          let url = "https://gumroad.com/oauth/token";
          let response = await request(
            url,
            null,
            null,
            HttpUtils.HTTPMethods.POST,
            body
          );
          console.log(response.body, "response in refresh");
      
          if (response.success) {
            return successResponse({
              accessToken: response.body.access_token,
              refreshToken: response.body.refresh_token
            });
          } else {
            return errorResponse(response.body, response.statusCode);
          }
        } catch (error) {
          return errorResponse(error.message);
        }
      },           
      refresh_on: [401],
      detect_on: "",
      credentials: connection => {
        return {
          accessToken: connection.oauthToken,
          'Authorization': `Bearer ${connection.oauthToken.accessToken}`
        };
      },
    }
  },
  actions: {
    products: {
      description: "Retrieve product details",
      hint: "Get details of a specific product from Gumroad",
      input_fields: () => [
        {
          key: "Id",
          name: "Product ID",
          hintText: "Enter the ID of the product you want to retrieve",
          helpText: "Enter the ID of the product you want to retrieve",
          required: true,
          type: "string",
          controlType: "text",
          isExtendedSchema: false,
        },
      ],
      execute: async (connection, input) => {
        try {
          const url = `https://api.gumroad.com/v2/products/${input.Id}`;
          
          const headers = app.connection.authorization.credentials(connection);
          
          const response = await HttpUtils.request(
            url,
            headers,
            null,
            HttpUtils.HTTPMethods.GET 
          );

          if (response.success === true) {
            return HttpUtils.successResponse(response.body);
          } else {
            return HttpUtils.errorResponse(response.body, response.statusCode);
          }
        } catch (error) {
          console.error("Error retrieving product details:", error); 
          return HttpUtils.errorResponse(error.message);
        }
      },
      output_fields: () => {
        return [
          {
            "key": "success",
            "name": "Success",
            "hintText": "Success",
            "helpText": "Success",
            "isExtendedSchema": false,
            "required": false,
            "type": "boolean",
            "controlType": "select",
            "pickList": [
              [
                "Yes",
                true
              ],
              [
                "No",
                false
              ]
            ]
          },
          {
            "key": "product",
            "name": "Product",
            "hintText": "Product",
            "helpText": "Product",
            "isExtendedSchema": false,
            "required": false,
            "type": "object",
            "controlType": "object",
            "properties": [
              {
                "key": "name",
                "name": "Name",
                "hintText": "Name",
                "helpText": "Name",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "description",
                "name": "Description",
                "hintText": "Description",
                "helpText": "Description",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "customizable_price",
                "name": "Customizable Price",
                "hintText": "Customizable Price",
                "helpText": "Customizable Price",
                "isExtendedSchema": false,
                "required": false,
                "type": "boolean",
                "controlType": "select",
                "pickList": [
                  [
                    "Yes",
                    true
                  ],
                  [
                    "No",
                    false
                  ]
                ]
              },
              {
                "key": "require_shipping",
                "name": "Require Shipping",
                "hintText": "Require Shipping",
                "helpText": "Require Shipping",
                "isExtendedSchema": false,
                "required": false,
                "type": "boolean",
                "controlType": "select",
                "pickList": [
                  [
                    "Yes",
                    true
                  ],
                  [
                    "No",
                    false
                  ]
                ]
              },
              {
                "key": "id",
                "name": "Id",
                "hintText": "Id",
                "helpText": "Id",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "price",
                "name": "Price",
                "hintText": "Price",
                "helpText": "Price",
                "isExtendedSchema": false,
                "required": false,
                "type": "number",
                "controlType": "text"
              },
              {
                "key": "currency",
                "name": "Currency",
                "hintText": "Currency",
                "helpText": "Currency",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "short_url",
                "name": "Short Url",
                "hintText": "Short Url",
                "helpText": "Short Url",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "tags",
                "name": "Tags",
                "hintText": "Tags",
                "helpText": "Tags",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "formatted_price",
                "name": "Formatted Price",
                "hintText": "Formatted Price",
                "helpText": "Formatted Price",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "published",
                "name": "Published",
                "hintText": "Published",
                "helpText": "Published",
                "isExtendedSchema": false,
                "required": false,
                "type": "boolean",
                "controlType": "select",
                "pickList": [
                  [
                    "Yes",
                    true
                  ],
                  [
                    "No",
                    false
                  ]
                ]
              },
              {
                "key": "file_info",
                "name": "File Info",
                "hintText": "File Info",
                "helpText": "File Info",
                "isExtendedSchema": false,
                "required": false,
                "type": "object",
                "controlType": "object",
                "properties": []
              },
              {
                "key": "deleted",
                "name": "Deleted",
                "hintText": "Deleted",
                "helpText": "Deleted",
                "isExtendedSchema": false,
                "required": false,
                "type": "boolean",
                "controlType": "select",
                "pickList": [
                  [
                    "Yes",
                    true
                  ],
                  [
                    "No",
                    false
                  ]
                ]
              },
              {
                "key": "custom_fields",
                "name": "Custom Fields",
                "hintText": "Custom Fields",
                "helpText": "Custom Fields",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              },
              {
                "key": "is_tiered_membership",
                "name": "Is Tiered Membership",
                "hintText": "Is Tiered Membership",
                "helpText": "Is Tiered Membership",
                "isExtendedSchema": false,
                "required": false,
                "type": "boolean",
                "controlType": "select",
                "pickList": [
                  [
                    "Yes",
                    true
                  ],
                  [
                    "No",
                    false
                  ]
                ]
              },
              {
                "key": "variants",
                "name": "Variants",
                "hintText": "Variants",
                "helpText": "Variants",
                "isExtendedSchema": false,
                "required": false,
                "type": "string",
                "controlType": "text"
              }
            ]
          }
        ]
      },
      sample_output: (connection) => { 
        return {
          id: "uiaxt",
          name: "Awesome Product",
          description: "This is a detailed description of the awesome product.",
          price: 29
        };
      }
    },
    deleteProduct: {
      description: "Permanently delete a product",
      hint: "Remove a product from Gumroad permanently",
      input_fields: () => [
        {
          key: "Id",
          name: "Product ID",
          hintText: "Enter the ID of the product you want to delete",
          helpText: "Enter the ID of the product you want to delete",
          required: true,
          type: "string",
          controlType: "text",
          isExtendedSchema: false,
        },
      ],
      execute: async (connection, input) => {
        try {
          const url = `https://api.gumroad.com/v2/products/${input.Id}`;
          
          const headers = app.connection.authorization.credentials(connection);
          
          const response = await HttpUtils.request(
            url,
            headers,
            null,
            HttpUtils.HTTPMethods.DELETE 
          );

          let responseBody;
          if (typeof response.body === 'string') {
            try {
              responseBody = JSON.parse(response.body);
            } catch (parseError) {
              console.error("Error parsing response body:", parseError);
              return HttpUtils.errorResponse("Failed to parse response body", response.statusCode);
            }
          } else {
            responseBody = response.body;
          }
    
          if (response.success === true) {
            return HttpUtils.successResponse({
              message: responseBody.message || "The product has been deleted successfully."
            });
          } else {
            return HttpUtils.errorResponse(responseBody.message || response.body, response.statusCode);
          }
        } catch (error) {
          console.error("Error deleting product:", error); 
          return HttpUtils.errorResponse(error.message);
        }
      },
      output_fields: () => {
        return [
          {
            "key": "message",
            "name": "Message",
            "hintText": "Message",
            "helpText": "Message",
            "isExtendedSchema": false,
            "required": false,
            "type": "string",
            "controlType": "text"
          }
        ]
      },
      sample_output: (connection) => {
        return {
          message: "The product has been deleted successfully."
        };
      }
    },    
  },
  triggers: {},
  test: async connection => {
    try {
      let url = "https://api.gumroad.com/v2/products";
      let headers = app.connection.authorization.credentials(connection);
      let response = await HttpUtils.request(url, headers);

      if (response.success) {
        return HttpUtils.successResponse(response.body);
      } else {
        return HttpUtils.errorResponse(response.message, response.statusCode);
      }
    } catch (error) {
      return HttpUtils.errorResponse(error.message);
    }
  },
  objectDefinitions: {
    product: [
      {
        key: "id",
        required: true,
        type: "string",
        isExtendedSchema: false,
        controlType: "text",
        name: "Product ID",
        hintText: "Unique identifier for the product",
        helpText: "The ID of the product",
      },
      {
        key: "name",
        required: true,
        type: "string",
        isExtendedSchema: false,
        controlType: "text",
        name: "Product Name",
        hintText: "Name of the product",
        helpText: "The name of the product",
      },
      {
        key: "description",
        required: false,
        type: "string",
        isExtendedSchema: false,
        controlType: "text",
        name: "Product Description",
        hintText: "Description of the product",
        helpText: "Detailed description of the product",
      },
      {
        key: "price",
        required: true,
        type: "number",
        isExtendedSchema: false,
        controlType: "text",
        name: "Product Price",
        hintText: "Price of the product",
        helpText: "The price of the product",
      },
      {
        key: "currency",
        required: false,
        type: "string",
        isExtendedSchema: false,
        controlType: "text",
        name: "Currency",
        hintText: "Currency used for the price",
        helpText: "The currency of the product price",
      },
      {
        key: "short_url",
        required: false,
        type: "string",
        isExtendedSchema: false,
        controlType: "text",
        name: "Short URL",
        hintText: "Short URL for the product",
        helpText: "A short URL link to the product",
      },
      {
        key: "tags",
        required: false,
        type: "array",
        as: "list",
        isExtendedSchema: false,
        controlType: "text",
        name: "Tags",
        hintText: "Tags associated with the product",
        helpText: "Array of tags related to the product",
      },
      {
        key: "formatted_price",
        required: false,
        type: "string",
        isExtendedSchema: false,
        controlType: "text",
        name: "Formatted Price",
        hintText: "Formatted price of the product",
        helpText: "The product price formatted as a string",
      },
      {
        key: "published",
        required: false,
        type: "boolean",
        isExtendedSchema: false,
        controlType: "checkbox",
        name: "Published",
        hintText: "Whether the product is published",
        helpText: "Status of the product publication",
      },
      {
        key: "deleted",
        required: false,
        type: "boolean",
        isExtendedSchema: false,
        controlType: "checkbox",
        name: "Deleted",
        hintText: "Whether the product is deleted",
        helpText: "Status of the product deletion",
      },
      {
        key: "customizable_price",
        required: false,
        type: "boolean",
        isExtendedSchema: false,
        controlType: "checkbox",
        name: "Customizable Price",
        hintText: "Whether the price is customizable",
        helpText: "Indicates if the product price can be customized",
      },
      {
        key: "require_shipping",
        required: false,
        type: "boolean",
        isExtendedSchema: false,
        controlType: "checkbox",
        name: "Require Shipping",
        hintText: "Whether shipping is required",
        helpText: "Indicates if the product requires shipping",
      },
      {
        key: "file_info",
        required: false,
        type: "object",
        isExtendedSchema: false,
        controlType: "text",
        name: "File Info",
        hintText: "Information about the file",
        helpText: "Details about the associated file",
      },
      {
        key: "custom_fields",
        required: false,
        type: "array",
        as: "list",
        isExtendedSchema: false,
        controlType: "text",
        name: "Custom Fields",
        hintText: "Custom fields for the product",
        helpText: "Array of custom fields related to the product",
      },
      {
        key: "is_tiered_membership",
        required: false,
        type: "boolean",
        isExtendedSchema: false,
        controlType: "checkbox",
        name: "Is Tiered Membership",
        hintText: "Whether the product is a tiered membership",
        helpText: "Indicates if the product is a tiered membership",
      },
      {
        key: "variants",
        required: false,
        type: "array",
        as: "list",
        isExtendedSchema: false,
        controlType: "text",
        name: "Variants",
        hintText: "Variants of the product",
        helpText: "Array of product variants",
      },
    ],
  }  
};

module.exports = app;
