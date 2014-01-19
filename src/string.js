(function (undef) {
    String.prototype.match = function (pattern, options) {
        //define default pattern
        if (!options) {
            options = {};
        }
        var opts = {
            returnAllMatch: options.returnAllMatch ? true : false,
            matchPattern: options.matchPattern || "(*)",
            noMatchPattern: options.noMatchPattern || "[*]",
            contactString: options.contactString || "||",
            ignoreCase: (options.ignoreCase == null || !options.ignoreCase) ? false : true
        }
        //trim pattern
        pattern = trimPattern(pattern, opts.noMatchPattern);
        //return all of string
        if (pattern == opts.matchPattern) {
            return this;
        }
        //complie pattern
        var patternList = complie(pattern,
                                    opts.ignoreCase,
                                    opts.matchPattern,
                                    opts.noMatchPattern),
            patternLen = patternList.length,
            resultList = [];
        //no match
        if (patternLen == 0) {
            return "";
        }
        //Ignore Case
        var originStr = this,
            ignoreCaseStr = opts.ignoreCase ? originStr.toLowerCase() : this,
            searchIndex = -1,
            searchStart = 0,
            lastMatch = false;
        //console.log(patternList);
        while (searchIndex++ < patternLen - 1) {
            var patternInfo = patternList[searchIndex],
                //search start
                tmpStart = ignoreCaseStr.indexOf(patternInfo.pattern),
                //return match
                tmpMatch = patternInfo.match;

            if (patternInfo.pattern == '') {
                if (searchIndex == 0) {
                    //start with matchString
                    searchIndex++;
                    patternInfo = patternList[searchIndex];
                    //so it must has indexOf
                    searchStart = ignoreCaseStr.indexOf(patternInfo.pattern);
                    //push result
                    if (searchStart > -1) {
                        //push result
                        if (tmpMatch) {
                            resultList.push(originStr.substring(0, searchStart));
                        } else if (patternInfo.match) {
                            //next match
                            lastMatch = true;
                        }
                        //delete string
                        originStr = originStr.substring(searchStart + 1);
                        ignoreCaseStr = ignoreCaseStr.substring(searchStart + 1);
                    } else {
                        //not found
                        return "";
                    }
                } else if (searchIndex == patternLen - 1) {
                    //end width matchString
                    //match end of string
                    if (tmpMatch) {
                        resultList.push(originStr);
                    }
                    break;
                }
            } else {
                //last match
                if (tmpStart == -1) {
                    return "";
                }
                //match last
                if (lastMatch) {
                    resultList.push(originStr.substring(0, tmpStart));
                    lastMatch = false;
                }
                //delete string
                originStr = originStr.substring(tmpStart + patternInfo.len);
                ignoreCaseStr = ignoreCaseStr.substring(tmpStart + patternInfo.len);
                //start with matchString
                searchIndex++;
                if (searchIndex >= patternLen) {
                    break;
                }
                patternInfo = patternList[searchIndex];
                //end width match string
                //indexOf next pattern
                if (patternInfo.pattern == '') {
                    searchStart = ignoreCaseStr.length;
                } else {
                    searchStart = ignoreCaseStr.indexOf(patternInfo.pattern);
                }
                if (searchStart == -1) {
                    return ""
                }
                if (tmpMatch) {
                    //push result
                    resultList.push(originStr.substring(0, searchStart));
                } else if (patternInfo.match) {
                    //next match
                    lastMatch = true;
                }

                originStr = originStr.substring(searchStart + patternInfo.len);
                ignoreCaseStr = ignoreCaseStr.substring(searchStart + patternInfo.len);
            }
        }


        function trimPattern(pattern, noMatchPattern) {
            //skip start with noMatchPattern
            var noMatchIndex = pattern.indexOf(noMatchPattern),
                noMatchLen = noMatchPattern.length;
            if (noMatchIndex == 0) {
                pattern = pattern.substring(noMatchLen);
            }
            //skip end with noMatchPattern
            if (pattern.substr(-noMatchLen) == noMatchPattern) {
                pattern = pattern.substring(0, pattern.length - noMatchLen);
            }
            //console.log(pattern);
            return pattern;
        }
        //complie pattern info
        function complie(pattern, ignoreCase, matchPattern, noMatchPattern) {

            //not found match pattern
            if (pattern.indexOf(matchPattern) == -1) {
                return [];
            }
            //split match pattern
            var matchPatterns = pattern.split(matchPattern),
                list = [];

            //split not match pattern
            for (var i = 0, l = matchPatterns.length - 1; i <= l; i++) {
                if (matchPatterns[i].indexOf(noMatchPattern) > -1) {
                    var subPatterns = matchPatterns[i].split(noMatchPattern);
                    for (var n = 0, m = subPatterns.length - 1; n <= m; n++) {
                        list.push({
                            pattern: ignoreCase ? subPatterns[n].toLowerCase() : subPatterns[n],
                            len: subPatterns[n].length,
                            match: n == m ? (i < l ? true : false) : false
                        });
                    }
                } else {
                    //push list
                    list.push({
                        pattern: ignoreCase ? matchPatterns[i].toLowerCase() : matchPatterns[i],
                        len: matchPatterns[i].length,
                        match: true
                    });
                }
            }
            return list;
        }
        
        return resultList.join(opts.contactString);
    }
})();