const data = [
    {
        id: crypto.randomUUID(),
        name: 'Millionaire pound cake',
        description:
            'Why a millionaire pound cake? Because it\'s super rich! This scrumptious cake is the pride of an elderly belle from Jackson, Mississippi. The recipe comes from "The Glory of Southern Cooking" by James Villas.',
        instructions: [
            'Preheat the oven to 300 degrees',
            'Grease a 10-inch tube pan with butter, dust the bottom and sides with flour, and set aside',
            'In a large mixing bowl, cream the butter and sugar with an electric mixer and add the eggs one at a time, beating after each addition',
            'Alternately add the flour and milk, stirring till the batter is smooth',
            'Add the two extracts and stir till well blended',
            'Scrape the batter into the prepared pan and bake till a cake tester or knife blade inserted in the center comes out clean , about 1 1 / 2 hours',
            'Cool the cake in the pan on a rack for 5 minutes, then turn it out on the rack to cool completely',
        ],
        ingredients: [
            'butter',
            'sugar',
            'eggs',
            'all-purpose flour',
            'whole milk',
            'pure vanilla extract',
            'almond extract',
        ],
    },
    {
        id: crypto.randomUUID(),
        name: 'Berry french toast  oatmeal',
        description:
            'the first time i made oatmeal this way i thought it tasted like french toast topped with berries...thus the name! :) use whichever kind of berries you like...my personal favorite is cherries.',
        instructions: [
            'Add 1/2 cup old-fashioned oats and 1 cup water into a large microwaveable bowl',
            'Cook in microwave on 50% power for 6 minutes',
            'Place frozen berries in small bowl and defrost in microwave until the juice from the berries is released',
            'Add defrosted berries, sugar free syrup, butter spray, and flax seed together and stir well.',
            'Enjoy!',
        ],
        ingredients: [
            'old fashioned oats',
            'water',
            'berries',
            'ground flax seeds',
            'sugar-free syrup',
            "i can't believe it's not butter spread",
        ],
        // photo: 'assets/recipes/berry-oatmeal.jpg',
    },
    {
        id: crypto.randomUUID(),
        name: 'Blepandekager danish apple pancakes',
        description:
            "this recipe was found at website: mindspring.com - christian's danish recipes",
        instructions: [
            'Beat the eggs lightly and add the milk',
            'Combine the flour , sugar and salt',
            'Stir the flour mixture into the egg mixture , stirring in the cup of cream as you mix',
            'Fry the apple slices in butter in a skillet',
            'Preheat oven to 500 degrees',
            'Cover the bottom of an oven-proof baking dish , or heavy skillet , with apples',
            'Pour the batter over slices and bake in a preheated 500 oven',
            'When nearly done, remove from oven and sprinkle here and there with a mixture of sugar and cinnamon to taste',
            'place dabs of butter on the pancake and return to oven until browned',
            'just before serving , sprinkle with lemon juice , and cut into triangles',
        ],
        ingredients: [
            'eggs',
            'milk',
            'flour',
            'sugar',
            'salt',
            'cream',
            'apples',
            'butter',
            'cinnamon',
            'lemon juice',
        ],
        // photo: 'assets/recipes/danish-apple-pancakes.jpg',
    },
];

export default data;
