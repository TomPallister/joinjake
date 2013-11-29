using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Nancy;
using Nancy.Conventions;

namespace JoinJake
{
    public class HomeModule : Nancy.NancyModule
    {
        public HomeModule()
        {
            Get["/"] = _ => View["Views/index.html"];
        }

        public class ApplicationBootstrapper : DefaultNancyBootstrapper
        {
            protected override void ConfigureConventions(NancyConventions nancyConventions)
            {
                nancyConventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("Resources", @"Resources"));
                base.ConfigureConventions(nancyConventions);
            }
        }
    }
}