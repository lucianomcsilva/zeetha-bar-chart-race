export class zeetha_barchartrace { 
    
    //-------------------------------------------------------------------------------
    // constructor
    //-------------------------------------------------------------------------------
    constructor(PlaceHolder, Settings)
    {
        let default_settings = {
            width: 900, 
            height: 480,
            tickDuration: 1500,
            top_n: 10,
            margin: {
                top: 80,
                right: 0,
                bottom: 5,
                left: 60
            },
            title: "Zeetha Bar Chart Racing",
            logo: "logo.gif", 
            subtitle: "some awesome metric compared over time",
            source: "Build your own chart: <a href='https://github.com/lucianomcsilva/zeetha-bar-chart-race'> click here</a>"

        }           
        
        let _data;   
        let _svg;
        this._uuid = this.uuidv4(); 
        console.log(this._uuid);
        this._settings = {...default_settings, ...Settings};
        this._settings.placeholder = PlaceHolder;

        //Calculations based on above values.
        this._settings.barPadding = (this._settings.height-(this._settings.margin.bottom+this._settings.margin.top))/(this._settings.top_n*5);
        
        console.log(this._settings);        
        this.create_foundation();
        this.add_title();        
    }
    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
    //-------------------------------------------------------------------------------
    //Methods
    //-------------------------------------------------------------------------------
    run(){
        this._year_number = 2012;
        this._month_number = 1;
        this._year = 2012.08;
        this._ticker = 0;

        let ticker = d3.interval(e => {
        //let ticker =  setInterval(e => {
            let current_slice = this._column_settings[this._ticker++].column_id;
            
            let column_slice = this._data.filter(d => d.column_id == current_slice)
               .sort((a,b) => b.value - a.value)
               .slice(0, this._settings.top_n);
            column_slice.forEach((d,i) => d.rank = i);
      
            //if(Debug) 
            console.log('UUId', this._uuid, 'ColumnId: ', current_slice, ' Slice: ', column_slice);
      
            this._x.domain([0, d3.max(column_slice, d => d.value)]);
      
            this._svg.select('.xAxis')
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .call(this._xAxis);
      
            let bars = this._svg.selectAll('.bar').data(column_slice, d => d.row_id);
            
            bars
               .enter()
               .append('rect')
               .attr('class', d => `bar ${d.row_id.replace(/\s/g,'_')}`)
               .attr('x', this._x(0)+1)
               .attr( 'width', d => Math.max(0, this._x(d.value)-this._x(0)-1))
               .attr('y', d => this._y(this._settings.top_n+1)+5)
               .attr('height', this._y(1)-this._y(0)-this._settings.barPadding)
               .style('fill', d => d.colour)
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .attr('y', d => this._y(d.rank)+5);
      
            bars
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .attr('width', d => Math.max(0, this._x(d.value)-this._x(0)-1))
               .attr('y', d => this._y(d.rank)+5);
      
            bars
               .exit()
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .attr('width', d => Math.max(0, this._x(d.value)-this._x(0)-1))
               .attr('y', d => this._y(this._settings.top_n+1)+5)
               .remove();
      
            let labels = this._svg.selectAll('.label')
               .data(column_slice, d => d.row_id);
      
            labels
               .enter()
               .append('text')
               .attr('class', 'label')
               .attr('x', d => this._x(d.value)-0)  ////8
               .attr('y', d => this._y(this._settings.top_n+1)+5+((this._y(1)-this._y(0))/2))
               .style('text-anchor', 'end')
               .html(d => d.row_id)
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .attr('y', d => this._y(d.rank)+5+((this._y(1)-this._y(0))/2)-8)
      
            labels
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .attr('x', d => this._x(d.value)-0) //8
               .attr('y', d => this._y(d.rank)+5+((this._y(1)-this._y(0))/2)-8)
               .style('fill', d => (d.value == 0 || this._x(d.value) > 120) ? '#ffffff' : '#cccccc')
      
            labels
               .exit()
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .attr('x', d => this._x(d.value)-0)  //8
               .attr('y', d => this._y(this._settings.top_n+1)+5)
               .remove();
      
            let valueLabels = this._svg.selectAll('.valueLabel').data(column_slice, d => d.row_id);
      
            valueLabels
               .enter()
               .append('text')
               .attr('class', 'valueLabel')
               .attr('x', d => this._x(d.value)-8)
               .attr('y', d => this._y(this._settings.top_n+1)+8)
               .text(d => d3.format(',.0f')(d.value)) //lastValue
               .style('text-anchor', 'end')
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .attr('y', d => this._y(d.rank)+5+((this._y(1)-this._y(0))/2)+1);
            
            valueLabels
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .attr('x', d => this._x(d.value)-8)
               .attr('y', d => this._y(d.rank)+5+((this._y(1)-this._y(0))/2)+8)
               .style('fill', d => (d.value == 0 || this._x(d.value) > 120) ? '#ffffff' : '#cccccc')
               .tween("text", function(d) {
                  let i = d3.interpolateRound(d.lastValue, d.value);
                  return function(t) {
                     this.textContent = d3.format(',')(i(t));
                  };
               });
      
            valueLabels
               .exit()
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .attr('x', d => this._x(d.value)-8)
               .attr('y', d => this._y(this._settings.top_n+1)+8)
               .remove();
      
            let bar_icon = this._svg.selectAll('.bar_icon').data(column_slice, d => d.row_id);
      
            bar_icon
               .enter()
               .append("svg:image")
               .attr('width', 30)
               .attr('height', 30)
               .attr('href', d => d.icon)
               .attr('class', 'bar_icon')
               .attr('x', d => this._x(d.value)+0)
               .attr('y', d => this._y(this._settings.top_n+1)+10)
               //.attr('transform', d => 'rotate(90, ' +
               //                        (this._x(d.value)+30).toString() + ', ' +
               //                        (this._y(d.rank)+8).toString() + ')')
               .text(d => d3.format(',.0f')(d.lastValue))
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .attr('y', d => this._y(d.rank)+8);
      
            bar_icon
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .attr('x', d => this._x(d.value)+0)
               .attr('y', d => this._y(d.rank)+8)
               //.attr('transform', d => 'rotate(90, ' +
               //                        (this._x(d.value)+30).toString() + ', ' +
               //                        (this._y(d.rank)+8).toString() + ')')
      
            bar_icon
               .exit()
               .transition()
               .duration(this._settings.tickDuration)
               .ease(d3.easeLinear)
               .attr('x', d => this._x(d.value)+0)
               .attr('y', d => this._y(this._settings.top_n+1)+10)
               //.attr('transform', d => 'rotate(90, ' +
               //                        (this._x(d.value)+30).toString() + ', ' +
               //                        (this._y(d.rank)+8).toString() + ')')
               .remove();
      
            this._yearText 
                .html(column_slice[0].display_name);
        
            let logo2 = this._svg.selectAll('.logo');//.data(column_slice, d => d.row_id);
            logo2.attr("xlink:href", this._column_settings[this._column_settings.map(d => d.column_id).indexOf(column_slice[0].column_id)].img);
            
            console.log("logo", logo2, column_slice);

            if(this._ticker >= this._column_settings.length)
            {
                console.log('stoping', ticker);

                ticker.stop();
            }
         }, this._settings.tickDuration);
    }
    //-------------------------------------------------------------------------------
    // Add Title
    //-------------------------------------------------------------------------------
    add_title() {
        /* Title */
        let logo = this._svg.append('image')
            .attr('width', 30)
            .attr('height', 30)
            .attr('x', this._settings.barPadding)
            .attr('y', 0)
            .attr('href', this._settings.logo);
        
        let title = this._svg.append('text')
            .attr('class', 'title'+' '+this._uuid)
            .attr('x', 40 + this._settings.barPadding)
            .attr('y', 26) 
            .html(this._settings.title);
        
        let subTitle = this._svg.append("text")
            .attr("class", "subTitle"+' '+this._uuid)
            .attr("y", 60)
            .html(this._settings.subtitle);
        
        /* End Title */
        const logo2 = this._svg.append('image')
            .attr('class', 'logo'+' '+this._uuid)
            .attr('x', this._settings.width-this._settings.margin.right-10)
            .attr('y', this._settings.height-75)
            .attr('height', 200)
            .attr('width',  150)
            .attr('transform', 'translate(-150,-200)')
            .attr("xlink:href", "//upload.wikimedia.org/wikipedia/en/thumb/6/67/2018_FIFA_World_Cup.svg/227px-2018_FIFA_World_Cup.svg.png" );
            ;
        let caption = this._svg.append('text')
            .attr('class', 'caption'+' '+this._uuid)
            .attr('x', this._settings.width)
            .attr('y', this._settings.height)
            .style('text-anchor', 'end')
            .html(this._settings.source);    
    };
    //-------------------------------------------------------------------------------
    create_foundation() {
        this._svg = d3.select('#'+this._settings.placeholder).append("svg")
        .attr('class', this._uuid)
        .attr("width", this._settings.width)
        .attr("height", this._settings.height)
        .style("border", "1px solid silver")
        .style("padding", "20px")
        .style("margin", "0px");
        
    };
    /**
     *  Create Axis with rowSettings information
     */
    create_axis() {
        /* Axis and other basic chart stuffs */
        this._x = d3.scaleLinear()
            //.domain([0, d3.max(_data.row_settings, d => d.value)])
            .range([this._settings.margin.left, this._settings.width-this._settings.margin.right-65]);

        this._y = d3.scaleLinear()
            .domain([this._settings.top_n, 0])
            .range([this._settings.height-this._settings.margin.bottom, this._settings.margin.top]);

        this._xAxis = d3.axisTop()
            .scale(this._x)
            .ticks(this._settings.width > 500 ? 5:2)
            .tickSize(-(this._settings.height-this._settings.margin.top-this._settings.margin.bottom))
            .tickSize(-(this._settings.height-this._settings.margin.top-this._settings.margin.bottom))
            .tickFormat(d => d3.format(',')(d));

        this._svg.append('g')
            .attr('class', 'axis xAxis'+' '+this._uuid)
            .attr('transform', `translate(0, ${this._settings.margin.top})`)
            .call(this._xAxis)
            .selectAll('.tick line')
            .classed('origin', d => d == 0);
        
        this._svg.selectAll('rect.bar')
            .data(this._row_settings, d => d.column_id)
            .enter()
            .append('rect') 
            .attr('class', 'bar'+' '+this._uuid)
            .attr('x', this._x(0)+1)
            //.attr('width', d => x(d.value)-x(0)-1)
            .attr('width', 0)
            .attr('y', d => this._y(d.rank)+5)
            .attr('height', this._y(1)-this._y(0)-this._settings.barPadding)
            .style('fill', d => d.colour);
        
        this._svg.selectAll('text.label')
            .data(this._row_settings, d => d.column_id)
            .enter()
            .append('text')
            .attr('class', 'label'+' '+this._uuid)
            .attr('x', d => this._x(d.value)-8)
            .attr('y', d => this._y(d.rank)+5+((this._y(1)-this._y(0))/2)-8)
            .style('text-anchor', 'end')
            .html(d => d.row_id);
        
        this._svg.selectAll('image.bar_icon')
            .data(this._row_settings, d => d.column_id)
            .enter()
            .append("svg:image")
            .attr('class', 'bar_icon'+' '+this._uuid)
            .attr('width', 30)
            .attr('height', 30)
            //.attr('x', d => x(d.value)+30)
            //.attr('y', d => y(d.rank)+8)
            .attr('x', d => +30)
            .attr('y', d => this._y(d.rank)+8)
            //.attr('transform', d => 'rotate(90, ' +
            //                        (this._settings.margin.left+30).toString() + ', ' +
            //                        (this._y(d.rank)+8).toString() + ')')
            .attr('href', d => d.icon);
            
        this._svg.selectAll('text.valueLabel')
            .data(this._row_settings, d => d.column_id)
            .enter()
            .append('text')
            .attr('class', 'valueLabel'+' '+this._uuid)
            .attr('x', d => this._x(d.value)-8)
            .attr('y', d => this._y(d.rank)+5+((this._y(1)-this._y(0))/2)+8)
            .style('text-anchor', 'end')
            .text(d => d3.format(',.0f')(d.lastValue));

    }
    //-------------------------------------------------------------------------------
    /**
     * 
     * @param {row[]]} rowsSettings 
     */
    load_rows(rowsSettings, rowId = "row_id") {
        this._row_settings = rowsSettings;
        const metadata = Object.keys(this._row_settings[0]);
        const row_id = metadata.indexOf(rowId);
        this._row_settings.forEach((d, i) => {
            d.row_id = d[metadata[row_id]]; 
            d.value = 1; 
            d.rank = i
        });
        this.create_axis();
    }
    //-------------------------------------------------------------------------------
    /**
     * 
     * @param {*} columnSettings 
     */
    load_columns(columnSettings, ColumnId = "column_id") {
        this._column_settings = columnSettings;
        const metadata = Object.keys(this._column_settings[0]);
        const column_id = metadata.indexOf(ColumnId);
        this._column_settings.forEach((d, i) => {
            d.column_id = d[metadata[column_id]];
            d.value = 1;
            d.rank = i;
        });

        this._yearText = this._svg.append('text')
            //.data(this._column_settings, d => d.column_id)
            //.enter()        
            .attr('class', 'yearText'+' '+this._uuid)
            .attr('x', this._settings.width-this._settings.margin.right)
            .attr('y', this._settings.height-30)
            .style('text-anchor', 'end')
            .html(this._column_settings[0].display_name);
            //.call(halo, 20);        

    }
    //-------------------------------------------------------------------------------
    /**
     * 
     * @param {*} dataValues 
     */
    load_data(dataValues, IDs) {
                  
        IDs = {...{'row_id': 'row_id', 'column_id': 'column_id'}, ...IDs};        
        this._data = dataValues;
        
        const metadata = Object.keys(this._data[0]);
        const columnd_id = metadata.indexOf(IDs.column_id);
        const row_id = metadata.indexOf(IDs.row_id);

        //console.log(index, jndex, this._column_settings);
        //Put Rows and Columns Settings in Data for use in animation (denormalize) 
        this._data.forEach((d, i) => {
            d.row_id = d[metadata[row_id]];
            d.column_id = d[metadata[columnd_id]];
            const index = this._row_settings.map(d => d.row_id).indexOf(d.row_id);
            const jndex = this._column_settings.map(d => d.column_id).indexOf(d.column_id);
            
            //const index = this._row_settings.map(d => d.name).indexOf(d.name);
            //const jndex = this._column_settings.map(d => d.column_id).indexOf(d.year);            
            d.row_id = d[metadata[row_id]];
            d.column_id = d[metadata[columnd_id]];
            d.icon = this._row_settings[index].icon;
            d.colour = this._row_settings[index].colour;
            d.display_name = this._column_settings[jndex].display_name;
            d.lastValue = i == 0 ? 0 : this._data[i-1].value;
        });
    }
}