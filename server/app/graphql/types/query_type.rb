# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :node, Types::NodeType, null: true, description: "Fetches an object given its ID." do
      argument :id, ID, required: true, description: "ID of the object."
    end

    def node(id:)
      context.schema.object_from_id(id, context)
    end

    field :nodes, [Types::NodeType, null: true], null: true, description: "Fetches a list of objects given a list of IDs." do
      argument :ids, [ID], required: true, description: "IDs of the objects."
    end

    def nodes(ids:)
      ids.map { |id| context.schema.object_from_id(id, context) }
    end

    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    field :search, [Types::SearchResultType], null: false do
      argument :filter, Types::SearchFilterInputType, required: true
    end

    def search(filter:)
      mock_data = [
        { id: '1', name: 'Item One', category: 'Electronics' },
        { id: '2', name: 'Item Two', category: 'Books' },
        { id: '3', name: 'Item Three', category: 'Electronics' }
      ]

      if filter[:by_name]
        mock_data.select { |item| item[:name].downcase.include?(filter[:by_name].downcase) }
      elsif filter[:by_id]
        mock_data.select { |item| item[:id] == filter[:by_id] }
      elsif filter[:by_category]
        mock_data.select { |item| item[:category] == filter[:by_category] }
      else
        mock_data
      end
    end
  end
end
