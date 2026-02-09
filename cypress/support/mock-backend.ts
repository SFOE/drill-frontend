/**
 * Mock Backend Helper for Testing
 * Use these utilities to intercept backend API calls and return mock responses
 */

export const mockBackendResponses = {
  // Suitable for geothermal heating (harmonized_value: 1, green)
  suitable: {
    coord_x: 2683141,
    coord_y: 1247500,
    canton: 'BE',
    canton_config: {
      legend_url: 'https://wms.geo.admin.ch/?service=WMS&version=1.3.0&request=GetLegendGraphic&layers=ch.bfe.suitability-heat-pump&styles=&format=image/png',
      cantonal_energy_service_url: 'https://www.bfe.admin.ch/',
      thematic_geoportal_url: 'https://map.geo.admin.ch/'
    },
    ground_category: {
      layer_results: [
        {
          layer: 'ch.bfe.suitability-heat-pump',
          property_name: 'suitability',
          value: '1'
        }
      ],
      harmonized_value: 1,
      source_values: 'ch.bfe.suitability-heat-pump'
    },
    result_detail: {
      message: 'Geothermal heating is highly suitable',
      full_url: 'https://www.bfe.admin.ch/',
      detail: 'Ground conditions are ideal for heat pump installation'
    }
  },

  // Conditionally suitable (harmonized_value: 2, orange)
  withRestrictions: {
    coord_x: 2683141,
    coord_y: 1247500,
    canton: 'BE',
    canton_config: {
      legend_url: 'https://wms.geo.admin.ch/?service=WMS&version=1.3.0&request=GetLegendGraphic&layers=ch.bfe.suitability-heat-pump&styles=&format=image/png',
      cantonal_energy_service_url: 'https://www.bfe.admin.ch/',
      thematic_geoportal_url: 'https://map.geo.admin.ch/'
    },
    ground_category: {
      layer_results: [
        {
          layer: 'ch.bfe.suitability-heat-pump',
          property_name: 'suitability',
          value: '2'
        }
      ],
      harmonized_value: 2,
      source_values: 'ch.bfe.suitability-heat-pump'
    },
    result_detail: {
      message: 'Geothermal heating is conditionally suitable',
      full_url: 'https://www.bfe.admin.ch/',
      detail: 'Ground conditions have some limitations'
    }
  },

  // Not suitable (harmonized_value: 3, red)
  forbidden: {
    coord_x: 2683141,
    coord_y: 1247500,
    canton: 'BE',
    canton_config: {
      legend_url: 'https://wms.geo.admin.ch/?service=WMS&version=1.3.0&request=GetLegendGraphic&layers=ch.bfe.suitability-heat-pump&styles=&format=image/png',
      cantonal_energy_service_url: 'https://www.bfe.admin.ch/',
      thematic_geoportal_url: 'https://map.geo.admin.ch/'
    },
    ground_category: {
      layer_results: [
        {
          layer: 'ch.bfe.suitability-heat-pump',
          property_name: 'suitability',
          value: '3'
        }
      ],
      harmonized_value: 3,
      source_values: 'ch.bfe.suitability-heat-pump'
    },
    result_detail: {
      message: 'Geothermal heating is not suitable',
      full_url: 'https://www.bfe.admin.ch/',
      detail: 'Ground conditions do not allow installation'
    }
  },

  // Unknown/unavailable (harmonized_value: 4, blue)
  unknown: {
    coord_x: 2683141,
    coord_y: 1247500,
    canton: 'BE',
    canton_config: {
      legend_url: 'https://wms.geo.admin.ch/?service=WMS&version=1.3.0&request=GetLegendGraphic&layers=ch.bfe.suitability-heat-pump&styles=&format=image/png',
      cantonal_energy_service_url: 'https://www.bfe.admin.ch/',
      thematic_geoportal_url: 'https://map.geo.admin.ch/'
    },
    ground_category: {
      layer_results: [],
      harmonized_value: 4,
      source_values: ''
    },
    result_detail: {
      message: 'Data unavailable',
      full_url: '',
      detail: 'Information is not available'
    }
  },

  // Outside Switzerland (harmonized_value: 6, blue)
  outOfSwitzerland: {
    coord_x: 100,
    coord_y: 100,
    canton: null,
    canton_config: null,
    ground_category: {
      layer_results: [],
      harmonized_value: 6,
      source_values: 'outside_switzerland'
    },
    result_detail: {
      message: 'Location outside Switzerland',
      full_url: '',
      detail: 'This location is outside Switzerland'
    }
  },

  // Server error (harmonized_value: 99, purple)
  error: {
    coord_x: 2683141,
    coord_y: 1247500,
    canton: null,
    canton_config: null,
    ground_category: {
      layer_results: [],
      harmonized_value: 99,
      source_values: 'server_error'
    },
    result_detail: {
      message: 'Error retrieving data',
      full_url: '',
      detail: 'An error occurred'
    }
  }
}

/**
 * Mock the drill-category API endpoint
 * Usage in tests:
 *
 * cy.intercept('GET', 'ADD TWO STARS HERE/v1/drill-category/**', {
 *   statusCode: 200,
 *   body: mockBackendResponses.suitable
 * })
 */
export function mockDrillCategoryApi(responseType: keyof typeof mockBackendResponses) {
  cy.intercept('GET', '**/v1/drill-category/**', {
    statusCode: 200,
    body: mockBackendResponses[responseType]
  }).as('drillCategory')
}

/**
 * Mock API error response
 */
export function mockDrillCategoryError() {
  cy.intercept('GET', '**/v1/drill-category/**', {
    statusCode: 500,
    body: { error: 'Internal Server Error' }
  }).as('drillCategoryError')
}

/**
 * Mock Geoadmin search API to return consistent address results
 * Used for testing address search functionality
 */
export function mockGeoadminSearch(query: string, result?: { label: string; north_coord: number; east_coord: number }) {
  const defaultResult = {
    id: '12345',
    attrs: {
      label: 'L\'Auge-du-Bois 2b 2616 Renan BE',
      north_coord: 1247500,
      east_coord: 2683141,
      detail: '2616 Renan',
      origin: 'address'
    }
  }

  const responseBody = {
    results: [result || defaultResult]
  }

  cy.intercept('GET', `**/searchapi/v1/fulltextsearch*`, {
    statusCode: 200,
    body: responseBody
  }).as('geoadminSearch')
}
